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
	const lastDay = firstDay.plus({ days: firstDay.daysInMonth });
	const firstVisibleDay = firstDay.minus({ days: firstDay.weekday % 7 });
	const lastVisibleDay = lastDay.plus({ days: 6 - (lastDay.weekday % 7) });

	const weeks: JSX.Element[] = [];
	let days: JSX.Element[] = [];
	let date = firstVisibleDay, gridIndex = 0;
	while (date <= lastVisibleDay)
	{
		days.push(
			<Day key={"day-"+gridIndex} gridIndex={gridIndex} date={date} isOverflow={date.month != today.month} />);

		if (days.length === 7)
		{
			weeks.push(
				<tr className="week" key={"week-"+gridIndex%7}>
					{days}
				</tr>
			);
			days = [];
		}

		date = date.plus({ days: 1 });
		gridIndex++;
	}

	return weeks;
}
