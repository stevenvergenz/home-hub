import React from 'react';
import './Aqi.css';

type AqiParams = {
	zipCode: string;
}

/**
 * Full API response details found at https://docs.airnowapi.org/CurrentObservationsByZip/docs
 */
type ApiResponse = {
	ParameterName: string;
	AQI: number;
	Category: { Name: string; Number: number; }
}

export default function Aqi(params: AqiParams)
{
	const dummy = { ParameterName: "", AQI: -1, Category: { Name: "Unknown", Number: 7 } };
	const [aqi, setAqi] = React.useState(dummy as ApiResponse | undefined);

	React.useEffect(() =>
	{
		function processResults(res: ApiResponse[])
		{
			setAqi(res.reduce((max, val) => val.AQI > max.AQI ? val : max, dummy));
		}

		getCurrentAqi(params.zipCode).then(processResults);

		setInterval(() => {
			getCurrentAqi(params.zipCode).then(processResults);
		}, 1000 * 60 * 20);
	}, [params.zipCode]);

	const categoryClass = aqi?.Category.Name.toLowerCase().replace(/ /g, "_")

	return (
		<p className={"aqi " + categoryClass}>
			Air Quality: {aqi?.AQI} ({aqi?.ParameterName})<br />
			{aqi?.Category.Name}
		</p>
	);
}

export async function getCurrentAqi(zipCode: string): Promise<ApiResponse[]>
{
	const res = await fetch(`/api/aqi/getCurrentAqi?zipCode=${zipCode}`);
	return (await res.json()) as ApiResponse[];
}
