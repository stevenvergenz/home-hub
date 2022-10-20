import * as E from 'express';
import fetch from 'node-fetch';

async function getForecast(lat: string, long: string): Promise<any>
{
	const res = await fetch("https://api.openweathermap.org/data/2.5/forecast"
		+ `?lat=${lat}&lon=${long}&appid=${process.env.OPENWEATHERMAP_KEY}&cnt=26&units=imperial`);

	if (res.ok)
	{
		return { data: (await res.json()).list };
	}
	else
	{
		console.log("Error fetching forecast data:", res.statusText);
		return { data: null };
	}
}

async function getCurrent(lat: string, long: string)
{
	const res = await fetch("https://api.openweathermap.org/data/2.5/weather"
		+ `?lat=${lat}&lon=${long}&appid=${process.env.OPENWEATHERMAP_KEY}&units=imperial`);

	if (res.ok)
	{
		return { data: await res.json() };
	}
	else
	{
		console.log("Error fetching weather data:", res.statusText);
		return { data: null };
	}
}

export async function getCurrentWeatherHandler(req: E.Request, res: E.Response)
{
	const lat = req.query["lat"] as string,
		long = req.query["long"] as string;

	try
	{
		const payload = await getCurrent(lat, long);
		res.status(200).json(payload);
	}
	catch
	{
		res.sendStatus(500);
	}
}

export async function getForecastWeatherHandler(req: E.Request, res: E.Response)
{
	const lat = req.query["lat"] as string,
		long = req.query["long"] as string;

	try
	{
		const payload = await getForecast(lat, long);
		res.status(200).json(payload);
	}
	catch
	{
		res.sendStatus(500);
	}
}
