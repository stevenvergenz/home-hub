import { calendar_v3, google as G } from 'googleapis';
import { DateTime, Duration } from 'luxon';
import { IncomingMessage, ServerResponse } from 'http';
import { resolve } from 'path';

import CalendarConfig from './config';
const config = require(resolve(process.cwd(), process.env.CONFIG_PATH || './config.json')) as CalendarConfig;
const initGcal = false;

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
	lastUpdated: DateTime;
};

type CacheData =
{
	calendars: { [id: string]: Calendar };
	events: { [id: string]: Event };
	rangeStart: DateTime;
	rangeEnd: DateTime;
	lastRefresh: DateTime;
};

const Api = G.calendar("v3");
G.options({ auth: new G.auth.GoogleAuth({ scopes: [
	initGcal
		? "https://www.googleapis.com/auth/calendar"
		: "https://www.googleapis.com/auth/calendar.readonly",
	"https://www.googleapis.com/auth/calendar.events.readonly"
]}) });

let cachedEvents: CacheData;

getEvents();
setInterval(
	getEvents,
	Duration.fromObject({ minutes: parseInt(process.env.REFRESH_MINUTES ?? '60') }).toMillis());

async function getEvents(): Promise<void>
{
	console.log(`Fetching latest events from google as of ${cachedEvents?.lastRefresh}`);
	const now = DateTime.now();
	const [firstVisibleDay, lastVisibleDay] = getVisibleRange(now);

	const data: CacheData = {
		calendars: cachedEvents?.calendars ?? {},
		events: cachedEvents?.events ?? {},
		rangeStart: firstVisibleDay,
		rangeEnd: lastVisibleDay,
		lastRefresh: now
	};

	if (initGcal && !cachedEvents)
	{
		for (let i = 0; i < config.calendars.length; i++)
		{
			const res = await Api.calendarList.insert({ requestBody: 
				{ id: config.calendars[i], colorId: (4 + 5 * i).toString(), selected: true }});
			console.log(res.status, res.data);
		}
	}

	if (Object.keys(data.calendars).length !== config.calendars.length)
	{
		const calendarsResponse = await Api.calendarList.list();
		for (const calendar of calendarsResponse.data.items ?? [])
		{
			data.calendars[calendar.id as string] = {
				id: calendar.id as string,
				name: calendar.summary as string,
				bgColor: calendar.backgroundColor as string,
				fgColor: calendar.foregroundColor as string
			};
		}
	}

	for (const calendarId in data.calendars)
	{
		const eventsRes = await Api.events.list({
			calendarId,
			timeMin: firstVisibleDay.toISO(),
			timeMax: lastVisibleDay.toISO(),
			singleEvents: true,
			orderBy: "startTime",
			//updatedMin: cachedEvents?.lastRefresh.toISO()
		});

		for (const event of eventsRes.data.items ?? [])
		{
			data.events[event.id as string] = {
				calendarId: calendarId,
				calendar: data.calendars[calendarId],
				id: event.id as string,
				name: event.summary as string,
				startTime: parseDate(event.start),
				endTime: parseDate(event.end),
				lastUpdated: DateTime.fromISO(event.updated as string)
			};
		}
	}

	cachedEvents = data;
}

function getVisibleRange(today: DateTime): [DateTime, DateTime]
{
	const firstDay = DateTime.fromObject({ year: today.year, month: today.month, day: 1});
	const lastDay = firstDay.plus({ days: firstDay.daysInMonth });
	const firstVisibleDay = firstDay.minus({ days: firstDay.weekday % 7 });
	const lastVisibleDay = lastDay.plus({ days: 7 - (lastDay.weekday % 7) });
	return [firstVisibleDay, lastVisibleDay];
}

function parseDate(dt: calendar_v3.Schema$EventDateTime | undefined): DateTime
{
	if (dt?.dateTime) {
		return DateTime.fromISO(dt.dateTime);
	}
	else if (dt?.date) {
		return DateTime.fromFormat(dt?.date, "yyyy-MM-dd");
	}
	else {
		return DateTime.invalid("No date given in " + JSON.stringify(dt));
	}
}

export async function getEventsHandler(req: IncomingMessage, res: ServerResponse)
{
	const events = Object.values(cachedEvents?.events)
		.sort((a, b) => a.startTime.toSeconds() - b.startTime.toSeconds());
	res.writeHead(200, {'Content-Type': 'application/json'});
	res.write(JSON.stringify(events));
	res.end();
}
