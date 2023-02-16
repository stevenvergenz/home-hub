import React from 'react';
import { DateTime } from 'luxon';

import Event from './Event';
import { Event as ApiEvent } from './Api';
import './Calendar.css';

/*const colorData: {[id: string]: {background: string; foreground: string;}} = {
	'1': { background: '#ac725e', foreground: '#1d1d1d' },
	'2': { background: '#d06b64', foreground: '#1d1d1d' },
	'3': { background: '#f83a22', foreground: '#1d1d1d' },
	'4': { background: '#fa573c', foreground: '#1d1d1d' },
	'5': { background: '#ff7537', foreground: '#1d1d1d' },
	'6': { background: '#ffad46', foreground: '#1d1d1d' },
	'7': { background: '#42d692', foreground: '#1d1d1d' },
	'8': { background: '#16a765', foreground: '#1d1d1d' },
	'9': { background: '#7bd148', foreground: '#1d1d1d' },
	'10': { background: '#b3dc6c', foreground: '#1d1d1d' },
	'11': { background: '#fbe983', foreground: '#1d1d1d' },
	'12': { background: '#fad165', foreground: '#1d1d1d' },
	'13': { background: '#92e1c0', foreground: '#1d1d1d' },
	'14': { background: '#9fe1e7', foreground: '#1d1d1d' },
	'15': { background: '#9fc6e7', foreground: '#1d1d1d' },
	'16': { background: '#4986e7', foreground: '#1d1d1d' },
	'17': { background: '#9a9cff', foreground: '#1d1d1d' },
	'18': { background: '#b99aff', foreground: '#1d1d1d' },
	'19': { background: '#c2c2c2', foreground: '#1d1d1d' },
	'20': { background: '#cabdbf', foreground: '#1d1d1d' },
	'21': { background: '#cca6ac', foreground: '#1d1d1d' },
	'22': { background: '#f691b2', foreground: '#1d1d1d' },
	'23': { background: '#cd74e6', foreground: '#1d1d1d' },
	'24': { background: '#a47ae2', foreground: '#1d1d1d' }
};*/

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
