import React from 'react';
import { DateTime, Duration } from 'luxon';

import WeatherTile from './WeatherTile';
import { getCurrentWeather, getForecastWeather, WeatherReading } from './Api';
import useAutoRefreshingState from '../utils/useAutoRefreshingState';
import { weatherCron, forecastCron } from '../timings';

import './Weather.css';
import 'weather-icons/css/weather-icons.min.css'
import SolarGraph from './SolarGraph';

export default function Weather(): JSX.Element
{
	const [curWeather] = useAutoRefreshingState<WeatherReading | undefined>(
		"weather",
		undefined,
		() => getCurrentWeather(),
		[],
		weatherCron
	);

	const [forecast] = useAutoRefreshingState<WeatherReading[] | undefined>(
		"forecast",
		[],
		() => getForecastWeather(),
		[],
		forecastCron
	);

	return (
		<div className="weather panel">
			<WeatherTile big={true} data={curWeather} />
			<div className="weather-rows">
				<div className="weather-row">
					<WeatherTile data={forecast?.[0]} />
					<WeatherTile data={forecast?.[1]} />
					<WeatherTile data={forecast?.[2]} />
					<WeatherTile data={forecast?.[3]} />
				</div>
				<div className="weather-row">
					<WeatherTile data={getAggregateForecast(forecast, 1)} />
					<WeatherTile data={getAggregateForecast(forecast, 2)} />
					<WeatherTile data={getAggregateForecast(forecast, 3)} />
				</div>
			</div>
			<SolarGraph id="solarGraph" />
		</div>
	);
}

function getAggregateForecast(readings: WeatherReading[] | undefined, daysOut: number): WeatherReading | undefined
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
