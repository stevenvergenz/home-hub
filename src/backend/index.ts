import { config as dotenv } from 'dotenv';
dotenv();

import express from 'express';
import { resolve } from 'path';

import { getEventsHandler } from './calendar';
import { getCurrentAqiHandler } from './aqi';
import { getCurrentWeatherHandler, getForecastWeatherHandler } from './weather';
import { getConfigHandler } from './config';

process.on('unhandledRejection', err => console.error(err));
process.on('uncaughtException', ex => console.error(ex));

const app = express();

app.get('/api/config', getConfigHandler);
app.get('/api/calendar/getEvents', getEventsHandler);
app.get('/api/aqi/getCurrentAqi', getCurrentAqiHandler);
app.get('/api/weather/current', getCurrentWeatherHandler);
app.get('/api/weather/forecast', getForecastWeatherHandler);

app.use(express.static(resolve(__dirname, '../build')));

app.use((req, res) => {
	res.status(404);
});

app.listen(process.env.PORT || 5000);
