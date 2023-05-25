import * as E from 'express';
import { open } from 'sqlite';
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
		$consumed: apiJson.load.energy_imported
	}

	const db = await open({
		driver: sqlite3.Database,
		filename: resolve(__dirname, "../../history.sqlite")
	});

	await db.exec("CREATE TABLE IF NOT EXISTS Samples " +
		"(timestamp INT PRIMARY KEY, produced DOUBLE, consumed DOUBLE);");

	await db.run("INSERT INTO Samples (timestamp, produced, consumed) " +
		"VALUES ($timestamp, $produced, $consumed);", sample);

	await db.close();

	console.log(`Solar status: ${sample.$produced} produced, ${sample.$consumed} consumed`);
}
setInterval(pollGateway, 60000);
