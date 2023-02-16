import * as React from 'react';
import { DateTime } from 'luxon';

type TaskParams =
{
	title: string;
	due: DateTime | undefined;
	today: DateTime;
};

export default function Task(params: TaskParams): JSX.Element
{
	return (<li className='task'>
		<p className='title'>{params.title}</p>
		<p className='due'>{formatRelativeTime(params.due, params.today)}</p>
	</li>);
}

function formatRelativeTime(time: DateTime | undefined, today: DateTime): string
{
	if (time === undefined)
		return "???";

	const lowRes = time.hour === 0 && time.minute === 0;
	const diff = time.diff(today);

	let value: number;
	if (!lowRes && Math.abs(value = diff.as('minutes')) < 90)
	{
		const round = Math.round(value);
		return value >= 0 ? `in ${round} min` : `${-round} min ago`;
	}
	else if (!lowRes && Math.abs(value = diff.as('hours')) < 36)
	{
		const round = Math.round(value);
		return value >= 0 ? `in ${round} hours` : `${-round} hours ago`
	}
	else if (Math.abs(value = diff.as('days')) < 45)
	{
		const round = Math.round(value);
		return value >= 0 ? `in ${round} days` : `${-round} days ago`
	}
	else
	{
		const round = Math.round(diff.as('months'));
		return value >= 0 ? `in ${round} months` : `${-round} months ago`
	}
}
