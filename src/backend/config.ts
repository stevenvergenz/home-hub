import * as E from 'express';
import { resolve } from 'path';
import { readFile } from 'fs';

export type Config = {
	loaded: Promise<void>;
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
	solar: {
		gatewayIp: string;
		authCookie: string;
		userRecord: string;
	}
};

let loadSucceed: (value: void) => void;
let loadFailed: (reason?: any) => void;
const configLoaded = new Promise((accept, reject) => {
	loadSucceed = accept;
	loadFailed = reject;
});

let config: Config | null = null;
export { config, configLoaded };
readFile(
	resolve(process.cwd(), process.env.CONFIG_PATH || './config.json'),
	{ encoding: 'utf-8' },
	(err, data) => {
		if (err) {
			console.error(err);
			loadFailed();
		}
		else {
			config = JSON.parse(data) as Config;
			console.log("Config loaded");
			loadSucceed();
		}
	}
);

export function getConfigHandler(req: E.Request, res: E.Response)
{
	res.status(200).json(config);
}
