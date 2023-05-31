import { DateTime } from 'luxon';
import { svg } from 'd3';
import useAutoRefreshingState from '../utils/useAutoRefreshingState';
import { solarCron } from '../timings';
import { LineChart } from './LineChart';

type ApiSolar = {
	key: number;
	timestamp: number;
	produced: number;
	consumed: number;
};

export default function SolarGraph()
{
	const [solarData] = useAutoRefreshingState<ApiSolar[]>(
		"solarData",
		[],
		updateSolarData, 
		[], 
		solarCron);

		return <LineChart id="solarGraph" data={solarData} xField='timestamp' y1Field='produced' y2Field='consumed' />;
}

async function updateSolarData(): Promise<ApiSolar[]>
{
	const res = await fetch('/api/solar/history');
	const data = (await res.json()) as ApiSolar[];
	return data;
}

function getTimeIndex() {
	const now = DateTime.now();
	return now.hour * 4 + Math.floor(now.minute / 15);
}
