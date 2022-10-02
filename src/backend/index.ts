import { config as dotenv } from 'dotenv';
dotenv();

import express from 'express';
import { resolve } from 'path';

import { getEventsHandler } from './calendar';

const app = express();
const sessionId = Math.random();

function insertSessionId(req: express.Request, res: express.Response, next: express.NextFunction)
{
	res.setHeader('X-Server-Session', sessionId);
	next();
}

app.get('/api/calendar/getEvents', insertSessionId, getEventsHandler);

app.use(express.static(resolve(__dirname, '../build')));

app.use((req, res) => {
	res.status(404);
});

app.listen(process.env.PORT || 5000);
