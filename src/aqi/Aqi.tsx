import React from 'react';
import { Duration } from 'luxon';
import './Aqi.css';
import useAutoRefreshingState from '../utils/useAutoRefreshingState';

type AqiParams = {
	lat: number;
	long: number;
}

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

export default function Aqi(params: AqiParams)
{
	const [aqi, setAqi] = useAutoRefreshingState<ApiResponse>(
		dummy,
		() => getCurrentAqi(params.lat, params.long)
			.then((res: ApiResponse[]) => res.reduce((max, val) => val.AQI > max.AQI ? val : max, dummy)),
		[params.lat, params.long],
		Duration.fromObject({ hours: 1 }).toMillis()
	);

	const categoryClass = (aqi && aqi.AQI < 40 && aqi.AQI >= 0) ?
		"negligible" :
		aqi?.Category.Name.toLowerCase().replace(/ /g, "_")

	return (
		<p className={"aqi " + categoryClass}>
			Air Quality: {aqi?.AQI} ({aqi?.ParameterName})<br />
			{aqi?.Category.Name}
		</p>
	);
}

export async function getCurrentAqi(lat: number, long: number): Promise<ApiResponse[]>
{
	const res = await fetch(`/api/aqi/getCurrentAqi?lat=${lat}&long=${long}`);
	return (await res.json()) as ApiResponse[];
}
