import React from 'react';

export default function useAutoRefreshingState<T>(
	initValue: T,
	refreshAction: () => Promise<T>,
	dependencies: React.DependencyList,
	interval: number): [T, React.Dispatch<React.SetStateAction<T>>]
{
	const [state, setState] = React.useState<T>(initValue);
	React.useEffect(() =>
	{
		function run() {
			refreshAction().then(t => setState(t));
		}
		
		run();
		setInterval(run, interval);
	}, dependencies);

	return [state, setState];
}
