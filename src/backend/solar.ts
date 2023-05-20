import * as E from 'express';
import { IncomingMessage } from 'http';
import { Agent, request } from 'https';
import { config, configLoaded } from './config';

const httpsAgent = new Agent({
	rejectUnauthorized: false
});

function fetchNoValidate<T>(url: string, options: {method?: string, body?: string} = {method: 'GET'})
{
	let accept: (response: T) => void;
	let reject: (reason?: any) => void;

	function promiseFn(_accept: (response: T) => void, _reject: (reason?: any) => void)
	{
		accept = _accept;
		reject = _reject;

		const headers = { 
			"Cookie": [`AuthCookie=${config?.solar.authCookie}`, `UserRecord=${config?.solar.userRecord}`]
		};

		const req = request(url, { method: options.method, agent: httpsAgent, headers }, responseFn);
		console.log(req.getHeader('Cookie'));
		req.on('error', (e) => {
			reject(e);
		});
		req.end(options.body, 'utf-8');
	}

	function responseFn(res: IncomingMessage)
	{
		res.setEncoding('utf-8');

		let buffer = '';
		res.on('data', (chunk: any) => {
			buffer += chunk;
		});
		res.on('end', () => {
			accept(JSON.parse(buffer) as T);
		});
	}

	return configLoaded.then(() => new Promise(promiseFn));
}

export async function getSolarAggregates(req: E.Request, res: E.Response)
{
	try {
		const data = await fetchNoValidate<any>(`https://${config?.solar.gatewayIp}/api/meters/aggregates`);
		res.send(data);
	}
	catch (e) {
		res.status(500).send(e);
	}
}
