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

type Point = { x: number; y: number; };

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

const timeLabels = [
	"\u{1f552}", "\u{1f555}", "\u{1f558}", "\u{1f55b}", "\u{1f552}", "\u{1f555}", "\u{1f558}"];
const powerLabels = ["1", "2", "3", "4", "5", "6", "7", "8"];

function renderSvg(params: LineChartParams)
{
	const container = d3.select<HTMLDivElement, void>('#' + params.id);
	const node = container.node();
	if (!container || !node) return;

	const [svgWidth, svgHeight] = [node.clientWidth, node.clientHeight];
	const svg = getOrCreate<SVGSVGElement>(container, "svg#solarGraphSvg");
	
	svg
		.attr("width", svgWidth)
		.attr("height", svgHeight);

	const xScale = d3.scaleLinear([0, 95], [svgHeight - 16, 0]);
	const yScale = d3.scaleLinear(
		[0, d3.max(params.data, s => (s.produced > s.consumed ? s.produced : s.consumed))],
		[svgWidth, 0]);

	drawGrid(svg, yScale, "yScale", "y", 0, 80000, 10000, tick => powerLabels[Math.floor(tick/10000)-1],
		"10 kWh");
	drawGrid(svg, xScale, "xScale", "x", 0, 95, 12, tick => timeLabels[Math.round(tick / 12) - 1]);

	// produced
	const producedLine = d3.line<ApiSolar>()
		.y(s => xScale(s.key))
		.x(s => yScale(s.produced));

	getOrCreate<SVGPathElement>(svg, "path#producedStroke",
		e => e.attr("fill", "none").attr("stroke", "gold").attr("stroke-width", 1.5))
		.attr("d", producedLine(params.data));

	getOrCreate<SVGPathElement>(svg, "path#producedFill",
		e => e.attr("fill", "rgba(255, 255, 0, 0.2)").attr("stroke", "none"))
		.attr("d", producedLine(params.data) + `L${svgWidth},0`);

	// consumed
	const consumedLine = d3.line<ApiSolar>()
		.y(s => xScale(s.key))
		.x(s => yScale(s.consumed));

	getOrCreate<SVGPathElement>(svg, "path#consumedStroke",
		e => e.attr("fill", "none").attr("stroke", "blue").attr("stroke-width", 1.5))
		.attr("d", consumedLine(params.data));

	getOrCreate<SVGPathElement>(svg, "path#consumedFill",
		e => e.attr("fill", "rgba(0, 0, 255, 0.2)").attr("stroke", "none"))
		.attr("d", consumedLine(params.data) + `L${svgWidth},0`);

	// now line
	const split = xScale(params.data.findIndex((_, i, arr) => arr[i].timestamp < (arr[i-1]?.timestamp ?? 0)));
	getOrCreate<SVGRectElement>(svg, "rect#splitFill",
		e => e.attr("fill", "rgba(127,127,127,0.5)").attr("stroke", "none")
			.attr("x", 0).attr("y", 0).attr("width", svgWidth))
		.attr("height", split);
	getOrCreate<SVGLineElement>(svg, "line#splitStroke",
		e => e.attr("fill", "none").attr("stroke", "white").attr("stroke-width", 3))
		.attr("x1", 0).attr("y1", split).attr("x2", svgWidth).attr("y2", split);
}

function getOrCreate<T extends SVGElement>(
	svg: d3.Selection<any, void, HTMLElement, any>,
	selector: string, init?: (e: d3.Selection<T, void, HTMLElement, any>) => void)
{
	let e = svg.selectChild<T>(selector);
	if (e.size() === 0) {
		const [type, id] = selector.split('#');
		e = svg.append<T>(type).attr('id', id);
		if (init) {
			init(e);
		}
	}
	return e;
}

function drawGrid(
	svg: d3.Selection<SVGSVGElement, void, HTMLElement, any>,
	scale: d3.ScaleLinear<number, number, never>,
	id: string, axis: 'x' | 'y', start: number, end: number, step: number, tickLabel?: (value: number) => string,
	axisLabel?: string)
{
	const g = getOrCreate<SVGGElement>(svg, `g#${id}`);

	const width = parseFloat(svg.attr("width")),
		height = parseFloat(svg.attr("height"));

	for (let i = start; i <= end; i += step) {
		let startPt: Point, endPt: Point, labelOffset: Point;
		if (axis === 'y') {
			startPt = { x: scale(i), y: height - 16 };
			endPt = { x: startPt.x, y: 0 };
			labelOffset = { x: 7, y: -1 };
		}
		else {
			startPt = { x: 0, y: scale(i) };
			endPt = { x: width, y: startPt.y };
			labelOffset = { x: 8, y: 5 };
		}

		getOrCreate(g, `line#${axis}${i}`, e => e.attr("stroke", "grey").attr("stroke-width", 1))
			.attr("x1", startPt.x).attr("y1", startPt.y).attr("x2", endPt.x).attr("y2", endPt.y);

		if (tickLabel) {
			getOrCreate<SVGGElement>(g, `text#label${axis}${i}`,
				e => e.attr("fill", "grey").attr("text-anchor", "middle").attr("font-size", "0.9em"))
				.attr("x", startPt.x + labelOffset.x)
				.attr("y", startPt.y + labelOffset.y)
				.text(tickLabel(i));
		}

		if (axisLabel) {
			getOrCreate<SVGTextElement>(g, `text#axisLabel${axis}`,
				e => e.attr("text-anchor", "middle").attr("fill", "grey").attr("font-size", "0.9em").text(axisLabel))
				.attr("x", width / 2).attr("y", startPt.y + 16);
		}
	}
}
