import { DateTime } from 'luxon';
import { Scatter } from 'react-chartjs-2';
import useAutoRefreshingState from '../utils/useAutoRefreshingState';
import { solarCron } from '../timings';
import { Chart as ChartJs, LineElement, PointElement, ChartData, CategoryScale, LinearScale, Point, CoreChartOptions } from 'chart.js';
import { _DeepPartialObject } from 'chart.js/dist/types/utils';

ChartJs.register(LineElement, CategoryScale, LinearScale, PointElement);

type ApiSolar = {
	key: number;
	timestamp: number;
	produced: number;
	consumed: number;
};

type SolarChartData = ChartData<"scatter", (number | Point | null)[], unknown>;

export default function SolarGraph()
{
	const [solarData] = useAutoRefreshingState<SolarChartData>(
		"solarData",
		{ datasets: [] },
		updateSolarData, 
		[], 
		solarCron);

	const options = {
		parsing: false as const,
		scales: {
			x: {
				display: true,
				minimumValue: 0,
				maximumValue: 96,
				ticks: {
					display: false,
				}
			},
			y: {
				ticks: {
					display: false,
					minimumValue: 0
				}
			}
		}
	};

	return <Scatter data={solarData} options={options} />;
}

async function updateSolarData(): Promise<SolarChartData>
{
	const res = await fetch('/api/solar/history');
	const data = (await res.json()) as ApiSolar[];
	return {
		datasets: [
			{
				label: 'Produced',
				data: data.map(d => { return {x: d.key, y: d.produced}; }),
				backgroundColor: "rgb(255, 255, 0)",

			},
			{
				label: 'Consumed',
				data: data.map(d => { return {x: d.key, y: d.consumed}; }),
				backgroundColor: "rgb(0, 0, 255)"
			}
		]
	}
}

function getTimeIndex() {
	const now = DateTime.now();
	return now.hour * 4 + Math.floor(now.minute / 15);
}
