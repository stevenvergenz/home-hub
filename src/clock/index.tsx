import * as React from 'react';
import { DateTime } from 'luxon';
import './Clock.css';

export default function Clock()
{
	const [now, setNow] = React.useState(DateTime.now());
	React.useEffect(() => {
		setInterval(() => {
			setNow(DateTime.now());
		}, 5000);
	});

	return (
		<div className="clock">
			<h1>{now.toLocaleString(DateTime.TIME_SIMPLE)}</h1>
			<h2>{now.toLocaleString(DateTime.DATE_HUGE)}</h2>
		</div>
	)
}
