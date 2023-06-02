import { DateTime } from 'luxon';
import { useEffect } from 'react';
import useAutoRefreshingState from '../utils/useAutoRefreshingState';
import { solarCron } from '../timings';
import * as d3 from 'd3';

export type SolarGraphParams = {
	id: string;
};

type ApiSolar = {
	key: number;
	timestamp: number;
	produced: number;
	consumed: number;
};

type LineChartParams = {
	id: string;
	data: any[];
};

export default function SolarGraph(params: SolarGraphParams)
{
	useAutoRefreshingState<ApiSolar[]>(
		"solarData",
		[{key: 96, timestamp: 0, produced: 80000, consumed: 80000}],
		() => updateSolarData(params.id), 
		[params.id], 
		solarCron);

	return <div id={params.id} />;
}

async function updateSolarData(id: string): Promise<ApiSolar[]>
{
	const res = await fetch('/api/solar/history');
	const data = (await res.json()) as ApiSolar[];
	renderSvg({ id, data });
	return data;
}

function renderSvg(params: LineChartParams)
{
	const container = d3.select<HTMLDivElement, void>('#' + params.id);
	const node = container.node();
	if (!container || !node) return;

	const [svgWidth, svgHeight] = [node.clientWidth, node.clientHeight];
	let svg = container.selectChild<SVGSVGElement>("svg");
	if (svg.size() === 0) {
		svg = container.append("svg");
	}

	svg
		.attr("width", svgWidth)
		.attr("height", svgHeight);

	const xScale = d3.scaleLinear([0, 95], [svgHeight-1, 1]);
	const yScale = d3.scaleLinear(
		[0, d3.max(params.data, s => (s.produced > s.consumed ? s.produced : s.consumed))],
		[svgWidth - 1, 1]);

	// produced
	const producedLine = d3.line<ApiSolar>()
		.y(s => xScale(s.key))
		.x(s => yScale(s.produced));

	let producedStroke = svg.selectChild<SVGPathElement>("path#producedStroke");
	if (producedStroke.size() === 0) {
		producedStroke = svg.append("path")
			.attr("id", "producedStroke")
			.attr("fill", "none")
			.attr("stroke", "gold")
			.attr("stroke-width", 1.5);
	}

	let producedFill = svg.selectChild<SVGPathElement>("path#producedFill");
	if (producedFill.size() === 0) {
		producedFill = svg.append("path")
			.attr("id", "producedFill")
			.attr("fill", "rgba(255, 255, 0, 0.2)")
			.attr("stroke", "none");
	}

	producedStroke.attr("d", producedLine(params.data));
	producedFill.attr("d", producedLine(params.data.concat([{key: 95, timestamp: 0, produced: 0, consumed: 0}])));

	// consumed
	const consumedLine = d3.line<ApiSolar>()
		.y(s => xScale(s.key))
		.x(s => yScale(s.consumed));

	let consumedStroke = svg.selectChild<SVGPathElement>("path#consumedStroke");
	if (consumedStroke.size() === 0) {
		consumedStroke = svg.append("path")
			.attr("id", "consumedStroke")
			.attr("fill", "none")
			.attr("stroke", "blue")
			.attr("stroke-width", 1.5);
	}

	let consumedFill = svg.selectChild<SVGPathElement>("path#consumedFill");
	if (consumedFill.size() === 0) {
		consumedFill = svg.append("path")
			.attr("id", "consumedFill")
			.attr("fill", "rgba(0, 0, 255, 0.2)")
			.attr("stroke", "none");
	}

	consumedStroke.attr("d", consumedLine(params.data));
	consumedFill.attr("d", consumedLine(params.data.concat([{key: 95, timestamp: 0, produced: 0, consumed: 0}])));

	// now line
	const split = xScale(params.data.findIndex((_, i, arr) => arr[i].timestamp > arr[i+1].timestamp));
	let splitStroke = svg.selectChild<SVGPathElement>("path#splitStroke");
	if (splitStroke.size() === 0) {
		splitStroke = svg.append("path")
			.attr("id", "splitStroke")
			.attr("fill", "none")
			.attr("stroke", "grey")
			.attr("stroke-width", 3);
	}
	splitStroke.attr("d", `M${svgWidth},${split}L0,${split}`);
}
