import React from 'react';
import { WeatherReading } from './Api';

import './Weather.css';
import 'weather-icons/css/weather-icons.css';

type WeatherTileParams =
{
	data: WeatherReading | undefined;
	big?: boolean;
};

export default function WeatherTile(params: WeatherTileParams): JSX.Element
{
	const classes: string[] = ["weather-tile"];
	if (params.big) {
		classes.push("big");
	}

	return (
		<div className={classes.join(" ")}>
			<i className="wi wi-day-sunny"></i>
			<p className="label">{formatTime(params.data?.dt)}</p>
			<p className="forecast">{params.data?.main.temp}</p>
		</div>
	);
}

function formatTime(dt: number | undefined): string
{
	return "6 PM";
}
