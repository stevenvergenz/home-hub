import { DateTime } from 'luxon';

export type Calendar =
{
	id: string;
	name: string;
	bgColor: string;
	fgColor: string;
};

export type Event =
{
	calendarId: string;
	calendar: Calendar;
	id: string;
	name: string;
	startTime: DateTime;
	endTime: DateTime;
};

let cachedEvents: Event[];
let getEventsPromise: Promise<Event[]> | null = null;

function getEvents(): Promise<Event[]>
{
	if (getEventsPromise !== null)
	{
		return getEventsPromise;
	}
	else
	{
		getEventsPromise = getEventsInternal();
		getEventsPromise.then(() => { getEventsPromise = null; })
	}
	return getEventsPromise;
}

export async function getEventsInternal(): Promise<Event[]>
{
	const res = await fetch("/api/calendar/getEvents");
	if (res.ok)
	{
		const data = await res.json();

		for (const e of data)
		{
			e.startTime = DateTime.fromISO(e.startTime);
			e.endTime = DateTime.fromISO(e.endTime);
		}

		cachedEvents = data as Event[];
		return cachedEvents;
	}
	else {
		throw new Error(`Failed to fetch events: ${res.status}`);
	}
}

export async function getEventsOnDay(day: DateTime): Promise<Event[]>
{
	if (!cachedEvents)
	{
		await getEvents();
	}
	
	const nextDay = day.plus({days: 1});
	const selectedEvents: Event[] = [];
	for (const e of cachedEvents)
	{
		if (e.startTime >= day && e.startTime < nextDay)
		{
			selectedEvents.push(e);
		}
	}

	return selectedEvents;
}
