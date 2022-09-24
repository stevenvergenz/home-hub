//import assert from 'assert';
import { google as G } from 'googleapis';
import { DateTime } from 'luxon';

type Calendar =
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

type CacheData =
{
	calendars: { [id: string]: Calendar };
	events: Event[];
	rangeStart: DateTime;
	rangeEnd: DateTime;
	lastRefresh: DateTime;
};

const Api = G.calendar("v3");

let cachedEvents: CacheData;
let getEventsPromise: Promise<void> | null = null;

function getEvents(): Promise<void>
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

async function getEventsInternal(): Promise<void>
{
	const today = DateTime.now();
	const firstDayOfMonth = DateTime.fromObject({ year: today.year, month: today.month, day: 1});
	const startDate = firstDayOfMonth.minus({ days: firstDayOfMonth.weekday % 7 });
	const endDate = startDate.plus({ days: 35 });

	const data: CacheData = {
		calendars: {},
		events: [],
		rangeStart: startDate,
		rangeEnd: endDate,
		lastRefresh: today
	};

	const calendarsResponse = await Api.calendarList.list();
	for (const calendar of calendarsResponse.data.items ?? [])
	{
		data.calendars[calendar.id as string] = {
			id: calendar.id as string,
			name: calendar.summary as string,
			bgColor: calendar.backgroundColor as string,
			fgColor: calendar.foregroundColor as string
		};

		const eventsRes = await Api.events.list({
			calendarId: calendar.id as string,
			timeMin: startDate.toISO(),
			timeMax: endDate.toISO(),
			singleEvents: true,
			orderBy: "startTime"
		});

		for (const event of eventsRes.data.items ?? [])
		{
			data.events.push({
				calendarId: calendar.id as string,
				calendar: data.calendars[calendar.id as string],
				id: event.id as string,
				name: event.summary as string,
				startTime: DateTime.fromISO(event.start?.dateTime as string),
				endTime: DateTime.fromISO(event.end?.dateTime as string)
			});
		}
	}

	cachedEvents = data;
}

export async function getEventsOnDay(day: DateTime): Promise<Event[]>
{
	if (!cachedEvents)
	{
		await getEvents();
	}
	
	//assert(day >= cachedEvents.rangeStart && day <= cachedEvents.rangeStart, `Day out of range: ${day}`);
	const nextDay = day.plus({days: 1});
	const selectedEvents: Event[] = [];
	for (const e of cachedEvents.events)
	{
		if (e.startTime <= day && e.startTime > nextDay)
		{
			selectedEvents.push(e);
		}
	}

	return selectedEvents;
}
