import { DateTime } from 'luxon';

import Day from './Day';
import './Calendar.css';

export default function Calendar()
{
	const today = DateTime.now();
	return (
		<div className="calendar">
			<h1>{today.monthLong}</h1>
			<table>
				<thead>
					<tr className="week">
						<th>Sunday</th>
						<th>Monday</th>
						<th>Tuesday</th>
						<th>Wednesday</th>
						<th>Thursday</th>
						<th>Friday</th>
						<th>Saturday</th>
					</tr>
				</thead>
				<tbody>
					{generateDayGrid()}
				</tbody>
			</table>
		</div>
	);
}

function generateDayGrid(): JSX.Element[]
{
	const today = DateTime.now();
	const firstDay = DateTime.fromObject({ year: today.year, month: today.month, day: 1});

	const weeks: JSX.Element[] = [];
	for (let i = 0; i < 5; i++)
	{
		const days: JSX.Element[] = [];
		for (let j = 0; j < 7; j++)
		{
			const gridIndex = 7 * i + j;
			const date = firstDay.plus({ days: gridIndex - (firstDay.weekday % 7) })
			days.push(<Day gridIndex={7 * i + j} date={date} isOverflow={date.month != today.month} />);
		}

		weeks.push(
			<tr className="week" key={"week-"+i}>
				{days}
			</tr>);
	}

	return weeks;
}
