import React from 'react';
import { DateTime } from 'luxon';
import './App.css';

import useAutoRefreshingState from './utils/useAutoRefreshingState';
import Calendar from './calendar';
import Aqi from './aqi';
import Clock from './clock';
import Weather from './weather';

export default function App()
{
	const [time] = useAutoRefreshingState(
		DateTime.now(),
		() => Promise.resolve(DateTime.now()),
		[],
		1000 * 60);
	const [date] = useAutoRefreshingState(
		DateTime.now(),
		() => Promise.resolve(DateTime.now()),
		[],
		1000 * 60 * 60
	);

	return (
		<div className="App">
			<div id="leftPane">
				<Clock time={time} />
				<Aqi lat={47.36} long={-122.16} />
				<Weather lat="47.36" long="-122.16" />
			</div>
			<div id="rightPane">
				<Calendar today={date} />
			</div>
		</div>
	);
}
