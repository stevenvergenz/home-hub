import * as React from 'react';
import { DateTime } from 'luxon';
import './Clock.css';

export default function Clock(params: { time: DateTime })
{
	return (
		<div className="clock">
			<h1>{params.time.toLocaleString(DateTime.TIME_SIMPLE)}</h1>
			<h2>{params.time.toLocaleString(DateTime.DATE_HUGE)}</h2>
		</div>
	)
}
