import { DateTime } from 'luxon';
import { Task as ApiTask } from './Api';
import Task from './Task';

type TaskGroupParams = 
{
	label: string;
	tasks: ApiTask[];
	today: DateTime;
};

const _oldDate = DateTime.fromObject({year: 0});
export default function TaskGroup(params: TaskGroupParams)
{
	function compareTasks(a: ApiTask, b: ApiTask): number
	{
		return (a.due?.datetime ?? a.due?.date ?? _oldDate)
			.diff(b.due?.datetime ?? b.due?.date ?? _oldDate)
			.as('minutes');
	}

	function processTask(t: ApiTask)
	{
		return <Task title={t.content} due={t.due?.datetime ?? t.due?.date} today={params.today} />;
	}

	if (params.tasks.length === 0)
	{
		return <div className="taskGroup" />;
	}
	else
	{
		return (
			<div className="taskGroup">
				<h3>{params.label}</h3>
				<ul>
					{params.tasks.sort(compareTasks).map(processTask)}
				</ul>
			</div>);
	}
}
