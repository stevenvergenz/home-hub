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

type DayState =
{
	specials: JSX.Element[];
	events: JSX.Element[];
};

export default function Day(props: DayProps)
{
	let [events, setEvents] = React.useState({events: [], specials: []} as DayState);
	React.useEffect(() => {
		getEventsOnDay(props.date)
		.then(es =>
		{
			const state: DayState = {events: [], specials: []};
			for (const e of es)
			{
				if (/holiday|birthday/i.test(e.calendar.name))
				{
					state.specials.push(<Event key={e.id} def={e} />);
				}
				else
				{
					state.events.push(<Event key={e.id} def={e} />);
				}
			}
			setEvents(state);
		});
	}, []);

	return (
		<td className={`day ${props.isOverflow ? "overflow" : ""}`}>
			<div className="dayHeader">
				<div className="dayLabel">{props.date.day}</div>
				<div className="tagList">{events.specials}</div>
			</div>
			{events.events}
		</td>
	);
}
