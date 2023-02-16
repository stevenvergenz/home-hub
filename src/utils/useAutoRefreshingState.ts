import React from 'react';
import { CronJob } from 'cron';

let lastJob = Promise.resolve();

export default function useAutoRefreshingState<T>(
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
				.then(t => setState(t))
				.catch(err => console.error(err));
		}
		
		run();

		new CronJob(
			interval,
			run,
			null,
			true,
			"America/Los_Angeles",
			null,
			true
		);
	}, dependencies);

	return [state, setState];
}
