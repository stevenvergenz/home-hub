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
			<i className={formatIcon(params.data?.weather[0].icon)}></i>
			<p className="label">{formatTime(params.data?.dt)}</p>
			<p className="forecast">{params.data?.main.temp.toFixed(0)}&deg;F</p>
		</div>
	);
}

function formatIcon(id?: string): string
{
	/*
	Day icon 	Night icon 	Description
	01d.png 	01n.png 	clear sky
	02d.png 	02n.png 	few clouds
	03d.png 	03n.png 	scattered clouds
	04d.png 	04n.png 	broken clouds
	09d.png 	09n.png 	shower rain
	10d.png 	10n.png 	rain
	11d.png 	11n.png 	thunderstorm
	13d.png 	13n.png 	snow
	50d.png 	50n.png 	mist 
	*/
	switch(id)
	{
		case "01d": return "wi wi-day-sunny";
		case "01n": return "wi wi-night-clear";
		case "02d": return "wi wi-day-overcast";
		case "02n": return "wi wi-night-alt-partly-cloudy";
		case "03d": return "wi wi-day-cloudy";
		case "03n": return "wi wi-night-alt-cloudy";
		case "04d":
		case "04n": return "wi wi-cloudy";
		case "09d": return "wi wi-showers";
		case "09n": return "wi wi-night-alt-showers";
		case "10d": return "wi wi-rain";
		case "10n": return "wi wi-night-alt-rain";
		case "11d": return "wi wi-thunderstorm";
		case "11n": return "wi wi-night-alt-thunderstorm";
		case "13d": return "wi wi-snow";
		case "13n": return "wi wi-night-alt-snow";
		case "50d": return "wi wi-day-haze";
		case "50n": return "wi wi-night-fog";
		default: return "wi wi-day-sunny";
	}
}

function formatTime(dt: number | undefined): string
{
	return "6 PM";
}
