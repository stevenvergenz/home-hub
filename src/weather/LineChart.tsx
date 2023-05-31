import * as d3 from 'd3';
import { useEffect } from 'react';

export type LineChartParams = {
	id: string;
	data: any[];
	xField: string;
	y1Field: string;
	y2Field: string;
};

export function LineChart(params: LineChartParams): JSX.Element
{
	useEffect(() => renderSvg(params), [params]);
	return <div className="lineChart" id={params.id} />;
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
