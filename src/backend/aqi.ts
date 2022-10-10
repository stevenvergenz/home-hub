import * as E from 'express';
import fetch from 'node-fetch';

export async function getCurrentAqi(zipCode: string): Promise<any>
{
	const res = await fetch("https://www.airnowapi.org/aq/observation/zipCode/current?format=application/json" +
		`&zipCode=${zipCode}&api_key=${process.env.AIRNOW_KEY}`);
	
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
	res.json(await getCurrentAqi(req.query["zipCode"] as string));
}
