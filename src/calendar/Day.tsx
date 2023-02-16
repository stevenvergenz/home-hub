import React from 'react';
import { DateTime } from 'luxon';

import './Calendar.css';

type DayProps =
{
	gridIndex: number;
	date: DateTime;
	isOverflow: boolean;
};

export default function Day(props: DayProps)
{
	//React.useEffect()

	return (
		<td className={`day ${props.isOverflow ? "overflow" : ""}`}
			title={props.date.toLocaleString()}>
			<div className="dayHeader">
				<span className="dayLabel">{props.date.day}</span>
				<span className="tagList"></span>
			</div>
		</td>
	);
}
