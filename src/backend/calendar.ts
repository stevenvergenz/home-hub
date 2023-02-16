import { calendar_v3, google as G } from 'googleapis';
import { DateTime } from 'luxon';
import * as E from 'express';
import { config } from './config';
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
};

type EventData =
{
	calendars: { [id: string]: Calendar };
	events: { [id: string]: Event };
	rangeStart: DateTime;
	rangeEnd: DateTime;
	lastUpdate: DateTime;
};

const Api = G.calendar("v3");
G.options({ auth: new G.auth.GoogleAuth({ scopes: [
	initGcal
		? "https://www.googleapis.com/auth/calendar"
		: "https://www.googleapis.com/auth/calendar.readonly",
	"https://www.googleapis.com/auth/calendar.events.readonly"
]}) });

const calendarCache: {[id: string]: Calendar} = {};

async function getEvents(
	firstVisibleDay: DateTime, lastVisibleDay: DateTime, 
	updatedSince: DateTime | undefined = undefined): Promise<EventData>
{
	const data: EventData = {
		calendars: calendarCache,
		events: {},
		rangeStart: firstVisibleDay,
		rangeEnd: lastVisibleDay,
		lastUpdate: DateTime.now()
	};

	if (initGcal)
	{
		for (const calendarId in config?.calendars ?? {})
		{
			const res = await Api.calendarList.insert({ requestBody: {
				id: calendarId,
				colorId: config?.calendars[calendarId].colorId?.toString(),
				backgroundColor: config?.calendars[calendarId].color,
				selected: true }});
		}
	}

	if (Object.keys(calendarCache).length !== Object.keys(config?.calendars ?? {}).length)
	{
		const calendarsResponse = await Api.calendarList.list();
		for (const calendar of calendarsResponse.data.items ?? [])
		{
			calendarCache[calendar.id as string] = {
				id: calendar.id as string,
				name: config?.calendars[calendar.id as string].name ?? calendar.summary as string,
				bgColor: calendar.backgroundColor as string,
				fgColor: calendar.foregroundColor as string
			};
		}
	}

	for (const calendarId in calendarCache)
	{
		const eventsRes = await Api.events.list({
			calendarId,
			timeMin: firstVisibleDay.toISO(),
			timeMax: lastVisibleDay.toISO(),
			updatedMin: updatedSince?.toISO(),
			singleEvents: true,
			showDeleted: true,
			orderBy: "startTime"
		});

		for (const event of eventsRes.data.items ?? [])
		{
			if (event.status !== 'cancelled')
			{
				data.events[event.id as string] = {
					calendarId: calendarId,
					calendar: data.calendars[calendarId],
					id: event.id as string,
					name: event.summary as string,
					startTime: parseDate(event.start),
					endTime: parseDate(event.end)
				};
			}
			else if (data.events[event.id as string])
			{
				delete data.events[event.id as string];
			}
		}
	}

	return data;
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

export async function getEventsHandler(req: E.Request, res: E.Response)
{
	const start = DateTime.fromISO(req.query["start"] as string);
	const end = DateTime.fromISO(req.query["end"] as string);
	let refresh: DateTime | undefined = undefined;
	if (req.query["updatedSince"]) {
		refresh = DateTime.fromISO(req.query["updatedSince"] as string);
	}

	const eventData = await getEvents(start, end, refresh);
	res.json(eventData);
}
