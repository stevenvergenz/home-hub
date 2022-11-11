import * as React from 'react';
import { DateTime } from 'luxon';

type TaskParams =
{
	title: string;
	dueDate: DateTime | undefined;
	dueTime: DateTime | undefined;
	today: DateTime;
};

export default function Task(params: TaskParams): JSX.Element
{
	return (<li className='task'>
		<p className='title'>{params.title}</p>
		<p className='due'>
			{params.dueTime?.toLocaleString(DateTime.TIME_SIMPLE) || params.dueDate?.toRelativeCalendar()}
		</p>
	</li>);
}
