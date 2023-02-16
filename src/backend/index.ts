import { createServer as createHttpServer } from 'http';
import { config as dotenv } from 'dotenv';

import { getEventsOnDayHandler } from './calendar';

dotenv();

const server = createHttpServer((req, res) => {
	if (req.url?.startsWith("/api/calendar/getEventsOnDay"))
	{
		console.log("Routing to getEventsOnDayHandler:", req.url);
		getEventsOnDayHandler(req, res);
	}
	else
	{
		console.log("404 handler");
		res.writeHead(404);
		res.end();
	}
});
server.listen(5000);


