type CurrentApiResponse =
{
	data: WeatherReading | undefined;
};

type ForecastApiResponse =
{
	data: WeatherReading[] | undefined;
};

export type WeatherReading =
{
	dt: number;
	main: { temp: number; };
	weather: { id: string; };
	clouds: { all: number; };
	pop?: number;
	sys?: { pod: string; };
};

export async function getCurrentWeather(lat: string, long: string): Promise<WeatherReading | undefined>
{
	const res = await fetch(`/api/weather/current?lat=${lat}&long=${long}`);
	if (res.ok) {
		const resData = await res.json() as CurrentApiResponse;
		return resData.data;
	}
	else {
		throw new Error(`Failure fetching current weather: ${res.statusText}`);
	}
}
