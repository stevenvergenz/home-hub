import React from 'react';
import { DateTime } from 'luxon';

import { Event as ApiEvent } from './Api';
import './Calendar.css';

type EventProps = {
	def: ApiEvent;
};

export default function Event(props: EventProps)
{
	return (
		<p className="event" style={{color: props.def.calendar.fgColor, backgroundColor: props.def.calendar.bgColor}}>
			{props.def.startTime.toLocaleString(DateTime.TIME_SIMPLE)} - {props.def.name}
		</p>
	);
}
