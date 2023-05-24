import { DateTime } from 'luxon';
import { Line } from 'react-chartjs-2';
import useAutoRefreshingState from '../utils/useAutoRefreshingState';
import { solarCron } from '../timings';
import { RingDataStore } from './RingDataStore';
import { Chart as ChartJs, LineElement } from 'chart.js';

ChartJs.register(LineElement);

export type ApiSolar = {
	t?: number;
	energyProduced: number;
	energyConsumed: number;
};

export default function SolarGraph()
{
	const [solarData] = useAutoRefreshingState<RingDataStore<ApiSolar>>(
		"solarData",
		new RingDataStore("solarData", 96, {t: 0, energyProduced: 0, energyConsumed: 0}),
		updateSolarData, 
		[], 
		solarCron);

	return (
		<Line
			data={{datasets: [
				{data: solarData.data, parsing: {yAxisKey: 'energyProduced'}},
				{data: solarData.data, parsing: {yAxisKey: 'energyConsumed'}}]}}
			options={{parsing: {xAxisKey: 't'}}}/>
	);
}

async function updateSolarData(ringData: RingDataStore<ApiSolar>): Promise<RingDataStore<ApiSolar>>
{
	const res = await fetch('/api/solar/aggregates');
	const data = await res.json() as ApiSolar;
	data.t = getTimeIndex();
	ringData.setData(data.t, data);

	return ringData;
}

function getTimeIndex() {
	const now = DateTime.now();
	return now.hour * 4 + Math.floor(now.minute / 15);
}
