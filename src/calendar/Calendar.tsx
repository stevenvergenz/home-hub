import { DateTime, Duration } from 'luxon';
import useAutoRefreshingState from '../utils/useAutoRefreshingState';

import Day from './Day';
import { EventData, getEvents } from './Api';
import './Calendar.css';

export default function Calendar(params: { today: DateTime }): JSX.Element
{
	const [events] = useAutoRefreshingState<EventData | undefined>(
		undefined,
		oldList => getEvents(oldList, ...getVisibleRange(params.today)),
		[params.today],
		Duration.fromObject({minutes: 20}).toMillis());

	return (
		<div className="calendar">
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
					{generateDayGrid(params.today, events)}
				</tbody>
			</table>
		</div>
	);
}

function generateDayGrid(today: DateTime, events: EventData | undefined): JSX.Element[]
{
	const [firstVisibleDay, lastVisibleDay] = getVisibleRange(today);

	const weeks: JSX.Element[] = [];
	let days: JSX.Element[] = [];
	let date = firstVisibleDay, gridIndex = 0;
	while (date <= lastVisibleDay)
	{
		days.push(
			<Day key={"day-"+gridIndex}
				gridIndex={gridIndex}
				date={date}
				now={today}
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

function getVisibleRange(today: DateTime): [DateTime, DateTime]
{
	const firstDay = today.set({ hour: 0, minute: 0, second: 0, millisecond: 0});
	const lastDay = firstDay.plus({ days: 14 });
	const firstVisibleDay = firstDay.minus({ days: 7 + (firstDay.weekday % 7) });
	const lastVisibleDay = lastDay.plus({ days: 7 - (lastDay.weekday % 7) });
	return [firstVisibleDay, lastVisibleDay];
}
