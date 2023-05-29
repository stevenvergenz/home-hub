import * as E from 'express';
import { Database, open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { resolve } from 'path';
import { DateTime } from 'luxon';
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
setInterval(pollGateway, 60000);

export async function getSolarAggregates(req: E.Request, res: E.Response)
{
	const db = await DB.acquire();
	const queryVars = {
		$resolution: 15*60,
		$divider: DateTime.now().set({ hour: 5, minute: 0, second: 0}).toUnixInteger()
	};

	const result = await db.all(`
		WITH TodaySamples AS (
			SELECT timestamp, produced, consumed,
				(timestamp - $divider) / $resolution AS slot
			FROM Samples
			WHERE timestamp >= $divider AND timestamp < $divider + 24*60*60
			GROUP BY slot
		), YesterdaySamples AS (
			SELECT timestamp, produced, consumed,
				(timestamp - $divider + 24*60*60) / $resolution AS slot
			FROM Samples
			WHERE timestamp >= $divider - 24*60*60 AND timestamp < $divider
			GROUP BY slot
		)
		SELECT slot, timestamp,
			produced - (SELECT MIN(produced) FROM TodaySamples) AS produced,
			consumed - (SELECT MIN(consumed) FROM TodaySamples) AS consumed
		FROM TodaySamples
		UNION
		SELECT slot, timestamp,
			produced - (SELECT MIN(produced) FROM YesterdaySamples) AS produced,
			consumed - (SELECT MIN(consumed) FROM YesterdaySamples) AS consumed
		FROM YesterdaySamples
		WHERE timestamp > (SELECT MAX(timestamp) - 24*60*60 FROM TodaySamples)
		ORDER BY slot;`,
		queryVars);
	/*
		*/

	await DB.release(db);
	res.json(result.map(x => { return {...x, timestamp: DateTime.fromSeconds(x.timestamp)}}));
	//res.send(result.map(x => `${DateTime.fromSeconds(x.time)},${x.produced},${x.consumed}`).join('<br/>'));
}
