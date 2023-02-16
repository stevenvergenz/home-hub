import React from 'react';
import './Aqi.css';
import useAutoRefreshingState from '../utils/useAutoRefreshingState';
import { aqiCron } from '../timings';

/**
 * Full API response details found at https://docs.airnowapi.org/CurrentObservationsByZip/docs
 */
type ApiResponse = {
	ParameterName: string;
	AQI: number;
	Category: { Name: string; Number: number; },
	DateObserved: string;
	HourObserved: number;
}

const dummy: ApiResponse = {
	ParameterName: "",
	AQI: -1,
	Category: { Name: "Unknown", Number: 7 },
	HourObserved: 0,
	DateObserved: "1900-01-01"
};

export default function Aqi()
{
	const [aqi] = useAutoRefreshingState<ApiResponse>(
		"aqi",
		dummy,
		() => getCurrentAqi()
			.then((res: ApiResponse[]) => res.reduce((max, val) => val.AQI > max.AQI ? val : max, dummy)),
		[],
		aqiCron
	);

	const categoryClass = (aqi && aqi.AQI < 40 && aqi.AQI >= 0) ?
		"negligible" :
		aqi?.Category.Name.toLowerCase().replace(/ /g, "_")

	return (
		<p className={"aqi panel " + categoryClass}>
			Air Quality: {aqi?.AQI} ({aqi?.ParameterName})<br />
			{aqi?.Category.Name}
		</p>
	);
}

export async function getCurrentAqi(): Promise<ApiResponse[]>
{
	const res = await fetch('/api/aqi/getCurrentAqi');
	return (await res.json()) as ApiResponse[];
}
