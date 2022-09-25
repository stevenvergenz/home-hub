import React from 'react';
import { DateTime } from 'luxon';

import Event from './Event';
import { getEventsOnDay } from './Api';
import './Calendar.css';

type DayProps =
{
	gridIndex: number;
	date: DateTime;
	isOverflow: boolean;
};

export default function Day(props: DayProps)
{
	let [events, setEvents] = React.useState([] as JSX.Element[]);
	React.useEffect(() => {
		getEventsOnDay(props.date).then(es => {
			setEvents(es.map(e => <Event key={e.id} def={e} />));
		});
	}, []);

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
