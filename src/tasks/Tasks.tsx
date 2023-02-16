import * as React from 'react';
import './Tasks.css';
import Task from './Task';
import { DateTime } from 'luxon';

type TasksParams =
{
	today: DateTime;
};

export default function Tasks(params: TasksParams)
{
	return (<div className='tasks panel'>
		<h3>Overdue</h3>
		<ul>
			<Task title={"Do a thing"} due={DateTime.now().minus({days: 2})} today={params.today} />
			<Task title={"Do a thing"} due={DateTime.now().minus({days: 1})} today={params.today} />
			<Task title={"Do a thing"} due={DateTime.now().minus({hours: 4})} today={params.today} />
		</ul>
		<h3>Today</h3>
		<ul>
			<Task title={"Do a thing"} due={DateTime.now()} today={params.today} />
			<Task title={"Do a thing"} due={DateTime.now()} today={params.today} />
			<Task title={"Do a thing"} due={DateTime.now()} today={params.today} />
			<Task title={"Do a thing"} due={DateTime.now()} today={params.today} />
		</ul>
		<h3>Tomorrow</h3>
		<ul>
			<Task title={"Do a thing"} due={DateTime.now()} today={params.today} />
			<Task title={"Do a thing"} due={DateTime.now()} today={params.today} />
			<Task title={"Do a thing"} due={DateTime.now()} today={params.today} />
			<Task title={"Do a thing"} due={DateTime.now()} today={params.today} />
		</ul>
	</div>);
}
