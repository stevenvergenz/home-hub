import React from 'react';
import { DateTime } from 'luxon';

import Event from './Event';
import { Event as ApiEvent } from './Api';
import './Calendar.css';

type DayProps =
{
	gridIndex: number;
	date: DateTime;
	events: ApiEvent[];
	isOverflow: boolean;
};

type DayState =
{
	specials: JSX.Element[];
	events: JSX.Element[];
};

export default function Day(props: DayProps)
{
	let [dayState, setDayState] = React.useState({events: [], specials: []} as DayState);
	React.useEffect(() => {
		const events = getEventsOnDay(props.date, props.events);
		const state: DayState = {events: [], specials: []};
		for (const e of events)
		{
			if (/holiday|birthday/i.test(e.calendar.name))
			{
				state.specials.push(<Event key={e.id} def={e} date={props.date} />);
			}
			else
			{
				state.events.push(<Event key={e.id} def={e} date={props.date} />);
			}
		}
		setDayState(state);
	}, [props.date, props.events]);

	return (
		<td className={`day ${props.isOverflow ? "overflow" : ""}`}>
			<div className="dayHeader">
				<div className="dayLabel">{props.date.day}</div>
				<div className="tagList">{dayState.specials}</div>
			</div>
			{dayState.events}
		</td>
	);
}

export function getEventsOnDay(day: DateTime, events: ApiEvent[]): ApiEvent[]
{
	const nextDay = day.plus({days: 1});
	const selectedEvents: ApiEvent[] = [];
	for (const e of events)
	{
		if (e.endTime > day && e.startTime < nextDay)
		{
			selectedEvents.push(e);
		}
	}

	return selectedEvents;
}
