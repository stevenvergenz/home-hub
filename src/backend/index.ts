import { createServer as createHttpServer } from 'http';
import { config as dotenv } from 'dotenv';

import { getEventsHandler } from './calendar';

dotenv();

const server = createHttpServer((req, res) => {
	if (req.url?.startsWith("/api/calendar/getEvents"))
	{
		console.log("Routing to getEventsHander:", req.url);
		getEventsHandler(req, res);
	}
	else
	{
		console.log("404 handler");
		res.writeHead(404);
		res.end();
	}
});
server.listen(5000);


