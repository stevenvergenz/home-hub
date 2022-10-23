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

export type EventData =
{
	calendars: { [id: string]: Calendar };
	events: { [id: string]: Event };
	lastUpdate: DateTime;
};

export async function getEvents(updateData: EventData | undefined, start: DateTime, end: DateTime): Promise<EventData>
{
	let url = `/api/calendar/getEvents?start=${start.toISO()}&end=${end.toISO()}`;
	if (updateData) {
		url += `&updatedSince=${updateData.lastUpdate.toISO()}`;
	}
	const res = await fetch(url);
	if (res.ok)
	{
		const data = await res.json();

		data.lastUpdate = DateTime.fromISO(data.lastUpdate);
		for (const eid in data.events)
		{
			data.events[eid].startTime = DateTime.fromISO(data.events[eid].startTime);
			data.events[eid].endTime = DateTime.fromISO(data.events[eid].endTime);
		}

		const events = data as EventData;
		if (updateData)
		{
			updateData.lastUpdate = events.lastUpdate;
			for (const id in events.events)
			{
				updateData.events[id] = events.events[id];
			}
			for (const id in updateData.events)
			{
				if (updateData.events[id].endTime < start) {
					delete updateData.events[id];
				}
			}
			return updateData;
		}
		else
		{
			return events;
		}
	}
	else {
		throw new Error(`Failed to fetch events: ${res.status}`);
	}
}
