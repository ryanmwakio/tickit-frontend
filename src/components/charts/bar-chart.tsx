"use client";

import { useEffect, useRef } from "react";
import { scaleBand, scaleLinear } from "d3-scale";
import { select } from "d3-selection";

export type BarDatum = {
  label: string;
  value: number;
};

type BarChartProps = {
  data: BarDatum[];
  className?: string;
  "aria-label"?: string;
};

export function BarChart({ data, className, "aria-label": ariaLabel }: BarChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) {
      return;
    }

    const width = 160;
    const height = 100;
    const svg = select(svgRef.current);
    svg.selectAll("*").remove();

    const xScale = scaleBand()
      .domain(data.map((datum) => datum.label))
      .range([0, width])
      .padding(0.3);

    const maxValue = Math.max(...data.map((datum) => datum.value));
    const yScale = scaleLinear().domain([0, maxValue]).range([height, 0]);

    const group = svg
      .append("g")
      .attr("transform", "translate(10, 10)");

    group
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (datum) => xScale(datum.label) ?? 0)
      .attr("width", xScale.bandwidth())
      .attr("y", (datum) => yScale(datum.value))
      .attr("height", (datum) => height - yScale(datum.value))
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("fill", "currentColor")
      .style("opacity", 0.85);

    group
      .selectAll("text")
      .data(data)
      .enter()
      .append("text")
      .attr("x", (datum) => (xScale(datum.label) ?? 0) + xScale.bandwidth() / 2)
      .attr("y", (datum) => yScale(datum.value) - 6)
      .attr("text-anchor", "middle")
      .attr("font-size", 10)
      .attr("fill", "#0f172a")
      .text((datum) => `${datum.value}%`);
  }, [data]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 180 120"
      className={className}
      role="img"
      aria-label={ariaLabel}
    />
  );
}

