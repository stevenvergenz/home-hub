import React from 'react';
import { DateTime } from 'luxon';

import { Event as ApiEvent } from './Api';
import './Calendar.css';

type EventProps = {
	def: ApiEvent;
	date: DateTime;
};

export default function Event(props: EventProps)
{
	const fullDay = props.def.startTime <= props.date && props.def.endTime >= props.date.plus({ days: 1 });
	const timeRange = props.def.startTime.toLocaleString(DateTime.TIME_SIMPLE);
	const title = props.def.name ?? "Busy";
	return (
		<p className="event" style={{color: props.def.calendar.fgColor, backgroundColor: props.def.calendar.bgColor}}>
			{ fullDay ? title : `${timeRange} - ${title}` }
		</p>
	);
}
