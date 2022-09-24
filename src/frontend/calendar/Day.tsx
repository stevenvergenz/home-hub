import React from 'react';
import { DateTime } from 'luxon';

import './Calendar.css';
import { Event, getEventsOnDay } from './Api';

type DayProps =
{
	gridIndex: number;
	date: DateTime;
	isOverflow: boolean;
};

export default function Day(props: DayProps)
{
	let events: JSX.Element[] = [];
	/*React.useEffect(() => {
		getEventsOnDay(props.date).then(es => {
			events = es.map(e => <p>{e.name}</p>);
		});
	}, []);*/

	return (
		<td className={`day ${props.isOverflow ? "overflow" : ""}`}
			title={props.date.toLocaleString()}>
			<div className="dayHeader">
				<span className="dayLabel">{props.date.day}</span>
				<span className="tagList"></span>
			</div>
			{events}
		</td>
	);
}
