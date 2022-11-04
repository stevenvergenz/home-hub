import React from 'react';
import { DateTime } from 'luxon';
import './App.css';
import { timeCron, dateCron } from './timings';

import useAutoRefreshingState from './utils/useAutoRefreshingState';
import Calendar from './calendar';
import Aqi from './aqi';
import Clock from './clock';
import Weather from './weather';

export default function App()
{
	const [time] = useAutoRefreshingState(
		null,
		DateTime.now(),
		() => Promise.resolve(DateTime.now()),
		[],
		timeCron);
	const [date] = useAutoRefreshingState(
		null,
		DateTime.now(),
		() => Promise.resolve(DateTime.now()),
		[],
		dateCron);

	return (
		<div className="App">
			<div id="leftPane">
				<Clock time={time} />
				<Aqi />
				<Weather />
			</div>
			<div id="rightPane">
				<Calendar today={time} />
			</div>
		</div>
	);
}
