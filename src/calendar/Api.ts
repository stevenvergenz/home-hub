import { google as G } from 'googleapis';
import { DateTime } from 'luxon';

export type Event = {
	name: string;
	startTime: DateTime
}

const Api = G.calendar("v3");

async function getCalendars() {
	const calendarsResponse = await Api.calendarList.list();
	calendarsResponse.data.items
}

export async function getEvents() {
	await getCalendars();
}
