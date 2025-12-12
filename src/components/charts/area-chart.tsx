"use client";

import { useEffect, useRef } from "react";
import { scaleLinear } from "d3-scale";
import { area as d3Area, curveMonotoneX } from "d3-shape";
import { select } from "d3-selection";

type AreaChartProps = {
  points: number[];
  className?: string;
  gradientId?: string;
  "aria-label"?: string;
};

export function AreaChart({
  points,
  className,
  gradientId = "areaGradient",
  "aria-label": ariaLabel,
}: AreaChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || points.length === 0) {
      return;
    }

    const width = 240;
    const height = 120;
    const svg = select(svgRef.current);
    svg.selectAll("*").remove();

    const max = Math.max(...points);
    const min = Math.min(...points);
    const xScale = scaleLinear().domain([0, points.length - 1]).range([0, width]);
    const yScale = scaleLinear().domain([min, max]).range([height, 0]);

    const areaGenerator = d3Area<number>()
      .x((_, index) => xScale(index))
      .y0(() => height)
      .y1((value) => yScale(value))
      .curve(curveMonotoneX);

    const defs = svg.append("defs");
    const gradient = defs
      .append("linearGradient")
      .attr("id", gradientId)
      .attr("x1", "0%")
      .attr("x2", "0%")
      .attr("y1", "0%")
      .attr("y2", "100%");

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "currentColor")
      .attr("stop-opacity", 0.35);

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "currentColor")
      .attr("stop-opacity", 0);

    svg
      .append("path")
      .datum(points)
      .attr("fill", `url(#${gradientId})`)
      .attr("d", areaGenerator(points) ?? "");

    svg
      .append("path")
      .datum(points)
      .attr("fill", "none")
      .attr("stroke", "currentColor")
      .attr("stroke-width", 2.4)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("d", areaGenerator.lineY1()(points) ?? "");
  }, [gradientId, points]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 240 120"
      className={className}
      role="img"
      aria-label={ariaLabel}
    />
  );
}

