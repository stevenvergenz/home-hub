import React from 'react';
import { CronJob } from 'cron';
import { DateTime } from 'luxon';

type CacheData<T> = {
	exp: DateTime;
	data: T;
};

let lastJob = Promise.resolve();

export default function useAutoRefreshingState<T>(
	cacheKey: string | null,
	initValue: T,
	refreshAction: (oldValue: T) => Promise<T>,
	dependencies: React.DependencyList,
	interval: string): [T, React.Dispatch<React.SetStateAction<T>>]
{
	const [state, setState] = React.useState<T>(initValue);
	React.useEffect(() =>
	{
		function run()
		{
			lastJob = lastJob
				.then(() => refreshAction(state))
				.then(t => {
					/*if (cacheKey) {
						cacheNewState(cacheKey, t, cron.nextDate());
					}*/
					setState(t);
				})
				.catch(err => console.error(err));
		}

		const cron = new CronJob(
			interval,
			run,
			null,
			true,
			"America/Los_Angeles",
			null,
			true
		);
		
		/*if (cacheKey)
		{
			const cachedData = getFromCache<T>(cacheKey);
			if (cachedData) {
				setState(cachedData);
			}
			else {
				run();
			}
		}
		else*/
		{
			run();
		}
	}, dependencies);

	return [state, setState];
}

function getFromCache<T>(key: string)
{
	if (window.location.search.includes("skipCache")) {
		return null;
	}
	
	const cacheStr = window.localStorage.getItem(key);
	if (!cacheStr) {
		return null;
	}

	const cache = JSON.parse(cacheStr) as CacheData<T>;
	hydrateDateTimes(cache);

	if (cache.exp.diffNow().as('minutes') < 0) {
		return null;
	}
	else {
		return cache.data;
	}
}

function cacheNewState<T>(key: string, data: T, exp: DateTime)
{
	window.localStorage.setItem(key, JSON.stringify({ exp, data } as CacheData<T>));
}

function hydrateDateTimes(obj: any)
{
	for (let key in obj)
	{
		const val = obj[key];
		if (typeof(val) === 'string')
		{
			const dt = DateTime.fromISO(val);
			if (dt.isValid) {
				obj[key] = dt;
			}
		}
		else if (typeof(val) === 'object')
		{
			hydrateDateTimes(val);
		}
	}
}
