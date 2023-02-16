import React from 'react';
import { DateTime } from 'luxon';
import './App.css';
import { timeCron, dateCron } from './timings';

import useAutoRefreshingState from './utils/useAutoRefreshingState';
import Calendar from './calendar';
import Aqi from './aqi';
import Clock from './clock';
import Weather from './weather';
import Tasks from './tasks';

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
		DateTime.now().set({ minute: 0, second: 0, millisecond: 0 }),
		() => Promise.resolve(DateTime.now()),
		[],
		dateCron);

	return (
		<div className="App">
			<div id="leftPane">
				<Clock time={time} />
				<Aqi />
				<Weather />
				<Tasks today={date} />
			</div>
			<div id="rightPane">
				<Calendar today={date} />
			</div>
		</div>
	);
}
