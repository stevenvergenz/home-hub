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
	xField: string;
	y1Field: string;
	y2Field: string;
};

const graphId = "solarGraph";

export default function SolarGraph(params: SolarGraphParams)
{
	useAutoRefreshingState<ApiSolar[]>(
		"solarData",
		[],
		() => updateSolarData(params.id), 
		[params.id], 
		solarCron);

	return <div id={params.id} />;
}

async function updateSolarData(id: string): Promise<ApiSolar[]>
{
	const res = await fetch('/api/solar/history');
	const data = (await res.json()) as ApiSolar[];
	renderSvg({ id: graphId, data, xField: "timestamp", y1Field: "produced", y2Field: "consumed" });
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
		.attr("height", svgHeight)
		.append("g")
			.append("rect")
				.attr("width", svgWidth)
				.attr("height", svgHeight)
				.style("fill", "#fff");
}
