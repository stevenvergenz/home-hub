import { DateTime } from 'luxon';
import { Task as ApiTask } from './Api';
import Task from './Task';

type TaskGroupParams = 
{
	label: string;
	tasks: ApiTask[];
	today: DateTime;
};

export default function TaskGroup(params: TaskGroupParams)
{
	return params.tasks.length > 0 ? (
		<div className="taskGroup">
			<h3>{params.label}</h3>
			<ul>
				{params.tasks.map(t => <Task title={t.content} dueTime={t.due?.datetime} dueDate={t.due?.date} today={params.today} />)}
			</ul>
		</div>)
		: <div className="taskGroup" />;
}
