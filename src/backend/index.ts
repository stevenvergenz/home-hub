import { config as dotenv } from 'dotenv';
dotenv();

import express from 'express';
import { resolve } from 'path';

import { getEventsHandler } from './calendar';
import { getCurrentAqiHandler } from './aqi';
import { getCurrentWeatherHandler, getForecastWeatherHandler } from './weather';
import { getConfigHandler } from './config';
import { getActiveTasksHandler } from './todoist';
import { getSolarAggregates } from './solar';

// TODO: FIX THIS SECURITY ISSUE!
// I couldn't get the CA for my gateway's self-signed cert, so here we are.
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

process.on('unhandledRejection', err => console.error(err));
process.on('uncaughtException', ex => console.error(ex));

const app = express();

app.get('/api/config', getConfigHandler);
app.get('/api/calendar/getEvents', getEventsHandler);
app.get('/api/aqi/getCurrentAqi', getCurrentAqiHandler);
app.get('/api/weather/current', getCurrentWeatherHandler);
app.get('/api/weather/forecast', getForecastWeatherHandler);
app.get('/api/todoist/tasks', getActiveTasksHandler);
app.get('/api/solar/history', getSolarAggregates);

app.use(express.static(resolve(__dirname, '../build')));

app.use((req, res) => {
	res.status(404);
});

app.listen(process.env.PORT || 5000);
