import { DateTime, Duration } from 'luxon';
import { useEffect, useState } from 'react';

import Day from './Day';
import { Event, getEvents } from './Api';
import './Calendar.css';

export default function Calendar()
{
	const [events, setEvents] = useState([] as Event[]);

	useEffect(() => {
		getEvents().then(es => setEvents(es));
		setInterval(
			async () => setEvents(await getEvents()),
			Duration.fromObject({minutes: 20}).toMillis());
	}, []);

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
					{generateDayGrid(events)}
				</tbody>
			</table>
		</div>
	);
}

function generateDayGrid(events: Event[]): JSX.Element[]
{
	const today = DateTime.now();
	const firstDay = DateTime.fromObject({ year: today.year, month: today.month, day: today.day });
	const lastDay = firstDay.plus({ days: 14 }); //firstDay.plus({ days: firstDay.daysInMonth });
	const firstVisibleDay = firstDay.minus({ days: firstDay.weekday % 7 });
	const lastVisibleDay = lastDay.plus({ days: 6 - (lastDay.weekday % 7) });

	const weeks: JSX.Element[] = [];
	let days: JSX.Element[] = [];
	let date = firstVisibleDay, gridIndex = 0;
	while (date <= lastVisibleDay)
	{
		days.push(
			<Day key={"day-"+gridIndex}
				gridIndex={gridIndex}
				date={date}
				events={events}
				isOverflow={date < today.minus({days: 1})}/>);

		if (days.length === 7)
		{
			weeks.push(
				<tr className="week" key={"week-"+weeks.length}>
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
