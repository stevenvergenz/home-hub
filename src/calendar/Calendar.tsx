import { Week } from './Week';
import './Calendar.css';

export default function Calendar() {
	const weeks = [0,1,2,3,4].map(i => <Week index={i} />);
	return (
		<table className="calendar">
			<thead>
				<Week header={true} index={-1} />
			</thead>
			<tbody>
				{weeks}
			</tbody>
		</table>
	);
}
