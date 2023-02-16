import React from 'react';
import { DateTime, Duration } from 'luxon';

import { Event as ApiEvent } from './Api';
import './Calendar.css';

type EventProps = {
	def: ApiEvent;
};

export default function Event(props: EventProps)
{
	const fullDay = props.def.startTime.plus({days: 1}).equals(props.def.endTime);
	const timeRange = props.def.startTime.toLocaleString(DateTime.TIME_SIMPLE);
		// + " - "
		// + props.def.endTime.toLocaleString(DateTime.TIME_SIMPLE);
	return (
		<p className="event" style={{color: props.def.calendar.fgColor, backgroundColor: props.def.calendar.bgColor}}>
			{ fullDay ? props.def.name : `${timeRange} - ${props.def.name ?? "Busy"}` }
		</p>
	);
}
