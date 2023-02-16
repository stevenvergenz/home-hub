import { config as dotenv } from 'dotenv';
dotenv();

import express from 'express';
import { resolve } from 'path';

import { getEventsHandler } from './calendar';
import { getCurrentAqiHandler } from './aqi';

process.on('unhandledRejection', err => console.error(err));
process.on('uncaughtException', ex => console.error(ex));

const app = express();

app.get('/api/calendar/getEvents', getEventsHandler);
app.get('/api/aqi/getCurrentAqi', getCurrentAqiHandler);

app.use(express.static(resolve(__dirname, '../build')));

app.use((req, res) => {
	res.status(404);
});

app.listen(process.env.PORT || 5000);
