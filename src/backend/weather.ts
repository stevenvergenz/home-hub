import * as E from 'express';
import fetch from 'node-fetch';
import { config } from './config';

async function getForecast(): Promise<any>
{
	const res = await fetch("https://api.openweathermap.org/data/2.5/forecast"
		+ `?lat=${config?.location.latitude}&lon=${config?.location.longitude}`
		+ `&appid=${process.env.OPENWEATHERMAP_KEY}&cnt=26&units=imperial`);

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

async function getCurrent()
{
	const res = await fetch("https://api.openweathermap.org/data/2.5/weather"
		+ `?lat=${config?.location.latitude}&lon=${config?.location.longitude}`
		+ `&appid=${process.env.OPENWEATHERMAP_KEY}&units=imperial`);

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
	try
	{
		const payload = await getCurrent();
		res.status(200).json(payload);
	}
	catch
	{
		res.sendStatus(500);
	}
}

export async function getForecastWeatherHandler(req: E.Request, res: E.Response)
{
	try
	{
		const payload = await getForecast();
		res.status(200).json(payload);
	}
	catch
	{
		res.sendStatus(500);
	}
}
