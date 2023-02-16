import * as React from 'react';
import { DateTime } from 'luxon';

type TaskParams =
{
	title: string;
	due: DateTime;
	today: DateTime;
};

export default function Task(params: TaskParams): JSX.Element
{
	return (<li className='task'>
		<p className='title'>{params.title}</p>
		<p className='due'>{params.due.hasSame(params.today, 'day')
			? params.due.toLocaleString(DateTime.TIME_SIMPLE) 
			: params.due.toRelativeCalendar()}</p>
	</li>);
}
