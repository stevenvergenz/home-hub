import * as React from 'react';
import { DateTime } from 'luxon';
import './Clock.css';

export default function Clock()
{
	const [now, setNow] = React.useState(DateTime.now());
	React.useEffect(() => {
		setTimeout(() => {
			setNow(DateTime.now());
			setInterval(() => {
				setNow(DateTime.now());
			}, 60000);
		}, (60 - DateTime.now().second) * 1000);
	});

	return (
		<div className="clock">
			<h1>{now.toLocaleString(DateTime.TIME_SIMPLE)}</h1>
			<h2>{now.toLocaleString(DateTime.DATE_HUGE)}</h2>
		</div>
	)
}
