import React from 'react';
import { DateTime, Duration } from 'luxon';

import WeatherTile from './WeatherTile';
import { getCurrentWeather, getForecastWeather, WeatherReading } from './Api';
import useAutoRefreshingState from '../utils/useAutoRefreshingState';

import './Weather.css';
import 'weather-icons/css/weather-icons.min.css'

type WeatherParams = {
	lat: string;
	long: string;
};

export default function Weather(params: WeatherParams): JSX.Element
{
	const [curWeather] = useAutoRefreshingState<WeatherReading | undefined>(
		undefined,
		() => getCurrentWeather(params.lat, params.long),
		[params.lat, params.long],
		1000 * 60 * 60
	);

	const [forecast] = useAutoRefreshingState<WeatherReading[] | undefined>(
		[],
		() => getForecastWeather(params.lat, params.long),
		[params.lat, params.long],
		1000 * 60 * 60 * 8
	);

	return (
		<div className="weather">
			<WeatherTile big={true} data={curWeather} />
			<div className="weather-rows">
				<div className="weather-row">
					<WeatherTile data={forecast?.[0]} />
					<WeatherTile data={forecast?.[1]} />
					<WeatherTile data={forecast?.[2]} />
				</div>
				<div className="weather-row">
					<WeatherTile data={findExtendedForecast(forecast, 1)} />
					<WeatherTile data={findExtendedForecast(forecast, 2)} />
					<WeatherTile data={findExtendedForecast(forecast, 3)} />
				</div>
			</div>
		</div>
	);
}

function findExtendedForecast(readings: WeatherReading[] | undefined, daysOut: number): WeatherReading | undefined
{
	if (!readings) return undefined;

	let targetDay = DateTime.now().plus({ days: daysOut });

	const aggReading: WeatherReading = {
		dt: targetDay,
		main: { temp_min: undefined, temp_max: undefined },
		weather: { icon: "00d", iconNum: 0 },
		pop: undefined
	};

	for (let i = 0; i < readings.length; i++)
	{
		if (readings[i].dt.hasSame(targetDay, 'day'))
		{
			aggReading.main.temp_min
				= Math.min(aggReading.main.temp_min ?? Infinity, readings[i].main.temp ?? 0);
			aggReading.main.temp_max
				= Math.max(aggReading.main.temp_max ?? -Infinity, readings[i].main.temp ?? 0);
			if (readings[i].weather.iconNum > aggReading.weather.iconNum) {
				aggReading.weather.icon = readings[i].weather.icon;
				aggReading.weather.iconNum = readings[i].weather.iconNum;
			}
			aggReading.pop = Math.max(aggReading.pop ?? -Infinity, readings[i].pop ?? -Infinity);
		}
	}

	return aggReading;
}
