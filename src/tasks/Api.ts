import { DateTime } from 'luxon';
import fetch from 'node-fetch';

export type Task = 
{
	id: string;
	projectId: string;
	content: string;
	due: {
		date: DateTime;
		datetime: DateTime;
	} | null;
};

export async function getTasks()
{
	const res = await fetch("/api/todoist/tasks");
	const data = await res.json() as any[];
	for (const t of data)
	{
		if (t.due?.date)
		{
			t.due.date = DateTime.fromISO(t.due.date as string);
		}
		if (t.due?.datetime)
		{
			t.due.datetime = DateTime.fromISO(t.due.datetime as string);
		}
	}

	return data as Task[];
}
