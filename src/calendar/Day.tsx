import React from 'react';
import './Calendar.css';

type DayProps = {
	monthIndex: number;
	gridIndex: number;
};

export default function Day(props: DayProps) { return (
	<td className="day" id={"day-"+props.gridIndex}>
		<div className="dayHeader">
			<span className="dayLabel">{props.monthIndex + 1}</span>
			<span className="tagList"></span>
		</div>
	</td>
);}
