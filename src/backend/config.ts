import * as E from 'express';
import { resolve } from 'path';
import { readFile } from 'fs';

export type Config = {
	calendars: {
		[id: string]: {
			name: string;
			colorId?: number;
			color?: string;
		}
	};
	location: {
		latitude: number;
		longitude: number;
	};
	todoProjects: string[];
};

let config: Config | null = null;
export { config };
readFile(
	resolve(process.cwd(), process.env.CONFIG_PATH || './config.json'),
	{ encoding: 'utf-8' },
	(err, data) => {
		if (err) {
			console.error(err);
		}
		else {
			config = JSON.parse(data) as Config;
		}
	}
);

export function getConfigHandler(req: E.Request, res: E.Response)
{
	res.status(200).json(config);
}
