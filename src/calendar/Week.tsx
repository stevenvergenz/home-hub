import Day from './Day';
import './Calendar.css';

type WeekProps = {
	header?: boolean;
	index: number;
};

export function Week(props: WeekProps) {
	let days: JSX.Element[];
	if (props.header) {
		days = [
			<th>Sunday</th>,
			<th>Monday</th>,
			<th>Tuesday</th>,
			<th>Wednesday</th>,
			<th>Thursday</th>,
			<th>Friday</th>,
			<th>Saturday</th>
		];
	}
	else {
		days = [0,1,2,3,4,5,6].map(i => <Day gridIndex={props.index * 7 + i} monthIndex={props.index * 7 + i} />);
	}

	return (
		<tr className="week" id={"week-"+props.index}>
			{days}
		</tr>
	); 
}
