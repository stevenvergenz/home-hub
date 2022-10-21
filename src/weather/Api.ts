import { DateTime } from 'luxon';

type ApiResponse<T> =
{
	data: T | undefined;
};

export type WeatherReading =
{
	/** Timestamp of the reading */
	dt: DateTime;
	/** The temperature in F */
	main: { temp?: number; temp_min?: number, temp_max?: number };
	/** The general weather status */
	weather: { icon: string; iconNum: number; };
	/** Percent chance of precipitation */
	pop?: number;
};

export async function getCurrentWeather(lat: string, long: string): Promise<WeatherReading | undefined>
{
	const res = await fetch(`/api/weather/current?lat=${lat}&long=${long}`);
	if (res.ok) {
		const resData = await res.json();
		if (resData.data) {
			resData.data.dt = DateTime.fromSeconds(resData.data.dt);
			resData.data.weather = resData.data.weather[0];
			resData.data.weather.iconNum = parseInt(resData.data.weather.icon.slice(0,2));
		}
		return resData.data as WeatherReading | undefined;
	}
	else {
		throw new Error(`Failure fetching current weather: ${res.statusText}`);
	}
}

export async function getForecastWeather(lat: string, long: string): Promise<WeatherReading[] | undefined>
{
	const res = await fetch(`/api/weather/forecast?lat=${lat}&long=${long}`);
	if (res.ok) {
		const resData = await res.json();
		if (resData.data)
		{
			for (const reading of resData.data)
			{
				reading.dt = DateTime.fromSeconds(reading.dt);
				reading.weather = reading.weather[0];
				reading.weather.iconNum = parseInt(reading.weather.icon.slice(0,2), 10);
			}
		}
		return resData.data as WeatherReading[] | undefined;
	}
	else {
		throw new Error(`Failure fetching forecast weather: ${res.statusText}`);
	}
}
