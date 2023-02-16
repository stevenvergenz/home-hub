import React from 'react';
import './App.css';
import Calendar from './calendar';

export default function App()
{
	return (
		<div className="App">
			<div id="leftPane">
				
			</div>
			<div id="rightPane">
				<Calendar />
			</div>
		</div>
	);
}
