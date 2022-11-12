import * as React from 'react';
import './Tasks.css';
import Task from './Task';
import { DateTime } from 'luxon';
import { Task as ApiTask, getTasks } from './Api';
import { tasksCron } from '../timings';
import useAutoRefreshingState from '../utils/useAutoRefreshingState';
import TaskGroup from './TaskGroup';

type TasksParams =
{
	today: DateTime;
};

export default function Tasks(params: TasksParams)
{
	const [tasks] = useAutoRefreshingState("tasks",
		[] as ApiTask[],
		getTasks,
		[],
		tasksCron);

	const overdue: ApiTask[] = [];
	const today: ApiTask[] = [];
	const tomorrow: ApiTask[] = [];
	const eventually: ApiTask[] = [];

	const now = DateTime.now();
	const eod = now.endOf('day');
	const eot = eod.plus({ days: 1 });

	for (const t of tasks)
	{
		const due = t.due?.datetime || t.due?.date;
		if (!due) {
			eventually.push(t);
		}
		else if (due.diff(now).as('minutes') < 0) {
			overdue.push(t);
		}
		else if (due.diff(eod).as('minutes') < 0) {
			today.push(t);
		}
		else if (due.diff(eot).as('minutes') < 0) {
			tomorrow.push(t);
		}
	}

	return (<div className='tasks panel'>
		<TaskGroup label="Overdue" tasks={overdue} today={params.today} />
		<TaskGroup label="Today" tasks={today} today={params.today} />
		<TaskGroup label="Tomorrow" tasks={tomorrow} today={params.today} />
		<TaskGroup label="Eventually" tasks={eventually} today={params.today} />
	</div>);
}
