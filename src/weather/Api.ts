type ApiResponse<T> =
{
	data: T | undefined;
};

export type WeatherReading =
{
	dt: number;
	main: { temp: number; };
	weather: { icon: string; }[];
	pop?: number;
	sys?: { pod: string; };
};

export async function getCurrentWeather(lat: string, long: string): Promise<WeatherReading | undefined>
{
	const res = await fetch(`/api/weather/current?lat=${lat}&long=${long}`);
	if (res.ok) {
		const resData = await res.json() as ApiResponse<WeatherReading>;
		return resData.data;
	}
	else {
		throw new Error(`Failure fetching current weather: ${res.statusText}`);
	}
}
