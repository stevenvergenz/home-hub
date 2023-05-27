import * as E from 'express';
import { Database, open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { resolve } from 'path';
import { config, configLoaded } from './config';

let headers: HeadersInit | undefined;

async function authenticate(): Promise<void>
{
	if (headers) {
		return;
	}

	await configLoaded;

	const body = {
		"username": "customer",
		"email": config?.solar.email,
		"password": config?.solar.password,
		"clientInfo": { "timezone":"America/Los_Angeles" }
	};
	const res = await fetch(new URL(`https://powerwall/api/login/Basic`),
		{ method: "POST", body: JSON.stringify(body) });

	headers = [
		["Cookie", res.headers.get("Set-Cookie") ?? ''],
		["Accept", "application/json"]
	];
}

type MyDatabase = Database<sqlite3.Database, sqlite3.Statement>
const DB = {
	_lockPromise: Promise.resolve(),
	_unblockAcquire: () => { },
	_leasedDb: null as MyDatabase | null,

	acquire: async function (): Promise<MyDatabase>
	{
		const acquirePromise = this._lockPromise
			.then(() => open({
				driver: sqlite3.Database,
				filename: resolve(__dirname, "../history.sqlite")
			}))
			.then(db => {
				this._leasedDb = db;
				return db;
			});
		this._lockPromise = acquirePromise.then(() => new Promise(accept => this._unblockAcquire = accept));
		return acquirePromise;
	},

	release: async function (db: MyDatabase): Promise<void>
	{
		if (db !== this._leasedDb) {
			throw new Error("Releasing a db that was not acquired!");
		}

		await db.close();
		this._leasedDb = null;
		this._unblockAcquire();
	}
}

async function pollGateway()
{
	await authenticate();

	const apiRes = await fetch(new URL(`https://powerwall/api/meters/aggregates`), { headers });
	if (apiRes.status >= 400) {
		console.error(await apiRes.text());
		headers = undefined;
		return;
	}

	const apiJson = await apiRes.json();
	const sample = {
		$timestamp: Math.floor(Date.parse(apiJson.solar.last_communication_time) / 1000),
		$produced: apiJson.solar.energy_exported,
		$consumed: apiJson.load.energy_imported,
		$instantProduction: apiJson.solar.instant_power,
		$instantConsumption: apiJson.load.instant_power
	}

	const db = await DB.acquire();

	await db.exec("CREATE TABLE IF NOT EXISTS Samples " +
		"(timestamp INT PRIMARY KEY, produced DOUBLE, consumed DOUBLE, " +
		"instant_production DOUBLE, instant_consumption DOUBLE);");

	await db.run("INSERT INTO Samples (timestamp, produced, consumed, instant_production, instant_consumption) " +
		"VALUES ($timestamp, $produced, $consumed, $instantProduction, $instantConsumption);", sample);

	await DB.release(db);

	console.log(`Solar status: ${sample.$produced} produced, ${sample.$consumed} consumed`);
}
//setInterval(pollGateway, 60000);

export async function getSolarAggregates(req: E.Request, res: E.Response)
{
	//const db = await DB.acquire();
	const queryVars = {
		$window: 60*60*24, // 24 hours in seconds
		$resolution: 96, // divide $window into 96 slices of 15 minutes each
		$divider: 60*60*5, // 5am in seconds
	};

	/*db.get(
		"WITH RecentSamples AS (" +
			"SELECT timestamp, produced, consumed " +
			"FROM Samples " +
			"WHERE timestamp > unixepoch() - $window) " + 
		"SELECT timestamp - (SELECT min(timestamp) from RecentSamples), produced, consumed " + 
		"FROM RecentSamples;", vars);*/
	/*db.get(
		"SELECT (timestamp - unixepoch()/$window*$window) / 60 as slot, " +
			"produced, consumed " +
		"FROM Samples " +
		"WHERE timestamp > unixepoch() - $window",
		queryVars
	)*/

	//await DB.release(db);
	res.send();
}

function getData(resolution: number, divider: number)
{
	const data: {timestamp: number, produced: number, consumed: number}[] = [];

	const now = Date.now();
	const window = 60*60*24;
	const startTime = Math.floor(now / window) * window + divider;

	return data.filter(s => s.timestamp >= startTime)
		.map((s, i, arr) => {
			return {
				slot: Math.floor((s.timestamp - startTime) / resolution),
				produced: s.produced - arr[0].produced,
				consumed: s.consumed - arr[0].consumed
			};
		})
		.concat(
			data.filter(s => s.timestamp >= startTime - window && s.timestamp < startTime)
				.map((s, i, arr) => {
					return {
						slot: Math.floor((s.timestamp + window - startTime) / resolution),
						produced: s.produced - arr[0].produced,
						consumed: s.consumed - arr[0].consumed
					};
				})
		);
}
