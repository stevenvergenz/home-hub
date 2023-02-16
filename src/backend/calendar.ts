import { calendar_v3, google as G } from 'googleapis';
import { DateTime } from 'luxon';
import { IncomingMessage, ServerResponse } from 'http';
import { resolve } from 'path';

import CalendarConfig from './config';

const config = require(resolve(__dirname, process.env.CONFIG_PATH || '../config.json')) as CalendarConfig;

type Calendar =
{
	id: string;
	name: string;
	bgColor: string;
	fgColor: string;
};

type Event =
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

async function getEventsInternal(): Promise<Event[]>
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

	const auth = new G.auth.GoogleAuth({ scopes: [
		"https://www.googleapis.com/auth/calendar",
		//"https://www.googleapis.com/auth/calendar.readonly",
		"https://www.googleapis.com/auth/calendar.events.readonly"
	]});
	G.options({ auth });

	if (!cachedEvents)
	{
		for (let i = 0; i < config.calendars.length; i++)
		{
			const res = await Api.calendarList.insert({ requestBody: 
				{ id: config.calendars[i], colorId: (4 + 5 * i).toString(), selected: true }});
			console.log(res.status, res.data);
		}
	}

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
				startTime: parseDate(event.start),
				endTime: parseDate(event.end)
			});

			if (!data.events[data.events.length - 1].startTime.isValid)
			{
				console.error('Error parsing datetime', data.events[data.events.length - 1].startTime.invalidReason);
			}
		}
	}

	cachedEvents = data;
	console.log("Cached events:", cachedEvents);
	return cachedEvents.events;
}

function parseDate(dt: calendar_v3.Schema$EventDateTime | undefined): DateTime
{
	if (dt?.dateTime) {
		return DateTime.fromISO(dt.dateTime);
	}
	else if (dt?.date) {
		console.log(dt?.date);
		return DateTime.fromFormat(dt?.date, "yyyy-MM-dd");
	}
	else {
		return DateTime.invalid("No date given in " + JSON.stringify(dt));
	}
}

export async function getEventsHandler(req: IncomingMessage, res: ServerResponse)
{
	try
	{
		const events = await getEvents();
		res.writeHead(200, {'Content-Type': 'application/json'});
		res.write(JSON.stringify(events));
		res.end();
	}
	catch (ex: any)
	{
		console.log(ex);
		res.writeHead(500, ex);
		res.end();
	}
}
