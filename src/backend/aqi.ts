import * as E from 'express';
import fetch from 'node-fetch';

export async function getCurrentAqi(lat: number, long: number): Promise<any>
{
	const res = await fetch("https://www.airnowapi.org/aq/observation/latLong/current/?format=application/json" +
		`&latitude=${lat}&longitude=${long}&distance=25&api_key=${process.env.AIRNOW_KEY}`);
	//const res = await fetch("https://www.airnowapi.org/aq/observation/zipCode/current?format=application/json" +
	//	`&zipCode=${zipCode}&api_key=${process.env.AIRNOW_KEY}`);
	
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
	res.json(await getCurrentAqi(
		parseFloat(req.query["lat"] as string),
		parseFloat(req.query["long"] as string)));
}
