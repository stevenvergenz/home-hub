import React from 'react';
import WeatherTile from './WeatherTile';
import { getCurrentWeather, WeatherReading } from './Api';
import useAutoRefreshingState from '../utils/useAutoRefreshingState';

import './Weather.css';
import 'weather-icons/css/weather-icons.min.css'

type WeatherParams = {
	lat: string;
	long: string;
};

export default function Weather(params: WeatherParams): JSX.Element
{
	const [curWeather, setCurWeather] = useAutoRefreshingState<WeatherReading | undefined>(
		undefined,
		() => getCurrentWeather(params.lat, params.long),
		[params.lat, params.long],
		1000 * 60 * 60
	);

	return (
		<div className="weather">
			<WeatherTile big={true} data={curWeather} />
			{/*<div className="weather-row">
				<WeatherTile name="9 AM" forecast="H: 67" icon="" />
				<WeatherTile name="10 AM" forecast="H: 67" icon="" />
				<WeatherTile name="11 AM" forecast="H: 67" icon="" />
				<WeatherTile name="12 PM" forecast="H: 67" icon="" />
				<WeatherTile name="1 PM" forecast="H: 67" icon="" />
				<WeatherTile name="2 PM" forecast="H: 67" icon="" />
				<WeatherTile name="3 PM" forecast="H: 67" icon="" />
			</div>*/}
		</div>
	);
}