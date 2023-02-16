import React from 'react';
import './App.css';

import Calendar from './calendar';
import Aqi from './aqi';
import Clock from './clock';
import Weather from './weather';

export default function App()
{
	return (
		<div className="App">
			<div id="leftPane">
				<Clock />
				<Aqi lat={47.36} long={-122.16} />
				<Weather lat="47.36" long="-122.16" />
			</div>
			<div id="rightPane">
				<Calendar />
			</div>
		</div>
	);
}
