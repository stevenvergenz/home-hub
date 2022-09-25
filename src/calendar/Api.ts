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

export async function getEventsOnDay(day: DateTime): Promise<Event[]>
{
	const res = await fetch(`/api/calendar/getEventsOnDay?day=${encodeURIComponent(day.toISO())}`);
	if (res.ok)
	{
		return (await res.json()) as Event[];
	}
	else {
		throw new Error(`Failed to fetch events for ${day}: ${res.status}`);
	}
}
