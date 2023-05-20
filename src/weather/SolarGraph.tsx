import { DateTime } from 'luxon';
import useAutoRefreshingState from '../utils/useAutoRefreshingState';
import { solarCron } from '../timings';

export type ApiSolar = {
	solar?: {
		last_communication_time: string;
		energy_exported: number;
	},
	load?: {
		last_communication_time: string;
		energy_imported: number;
	}
};

type SolarGraphParams =
{
	now: DateTime;
};

export default function SolarGraph(params: SolarGraphParams)
{
	const [solarData] = useAutoRefreshingState<ApiSolar>(
		"solarData",
		{},
		async () => fetch('/api/solar/aggregates').then(res => res.json()).then(json => json as ApiSolar), 
		[], 
		solarCron);
}
