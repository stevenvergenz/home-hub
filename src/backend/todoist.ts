import { TodoistApi } from '@doist/todoist-api-typescript';
import { Request, Response } from 'express';
import { config } from './config';

const Todoist = new TodoistApi(process.env.TODOIST_KEY as string);

async function getActiveTasks()
{
	const tasks = [];
	for (const project of config?.todoProjects ?? [])
	{
		tasks.push(...(await Todoist.getTasks({
			projectId: project
		})));
	}
	return tasks;
}

export async function getActiveTasksHandler(req: Request, res: Response)
{
	res.json(await getActiveTasks());
}
