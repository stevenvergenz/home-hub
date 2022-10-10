import React from 'react';
import './App.css';

import Calendar from './calendar';
import Aqi from './aqi';
import Clock from './clock';

export default function App()
{
	return (
		<div className="App">
			<div id="leftPane">
				<Clock />
				<Aqi zipCode="98042" />
			</div>
			<div id="rightPane">
				<Calendar />
			</div>
		</div>
	);
}
