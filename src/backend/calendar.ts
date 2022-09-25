import { google as G } from 'googleapis';
import { DateTime } from 'luxon';
import { IncomingMessage, ServerResponse } from 'http';

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
		//"https://www.googleapis.com/auth/calendar",
		"https://www.googleapis.com/auth/calendar.readonly",
		"https://www.googleapis.com/auth/calendar.events.readonly"
	]});
	G.options({ auth });

	/*const calendars: string[] = [
		"vergenzs@gmail.com", // steven
		"rebecca.ly92@gmail.com", // rebecca
		"642db9c7a8ce992a5c34bbdd1f38b0e33b1769c396c34de98e4868028be20885@group.calendar.google.com" // shared
	];
	for (const c of calendars)
	{
		await Api.calendarList.insert({ requestBody: { id: c } });
	}*/

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
	console.log("Cached events:", cachedEvents);
	return cachedEvents.events;
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
