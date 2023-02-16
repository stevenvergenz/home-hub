import * as E from 'express';
import fetch from 'node-fetch';
import { config } from './config';

export async function getCurrentAqi(): Promise<any>
{
	const res = await fetch("https://www.airnowapi.org/aq/observation/latLong/current/?format=application/json" +
		`&latitude=${config?.location.latitude}&longitude=${config?.location.longitude}` +
		`&distance=25&api_key=${process.env.AIRNOW_KEY}`);
	
	if (res.ok)
	{
		return (await res.json());
	}
	else
	{
		console.error("Error fetching AQI:", res.statusText);
		return [];
	}
}

export async function getCurrentAqiHandler(req: E.Request, res: E.Response)
{
	res.json(await getCurrentAqi());
}
