"use client";

import { useEffect, useRef } from "react";
import { scaleLinear } from "d3-scale";
import { line as d3Line, curveMonotoneX } from "d3-shape";
import { select } from "d3-selection";

type SparklineProps = {
  points: number[];
  className?: string;
  "aria-label"?: string;
};

export function Sparkline({ points, className, "aria-label": ariaLabel }: SparklineProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || points.length === 0) {
      return;
    }

    const width = 100;
    const height = 40;
    const svg = select(svgRef.current);
    svg.selectAll("*").remove();

    const max = Math.max(...points);
    const min = Math.min(...points);
    const xScale = scaleLinear().domain([0, points.length - 1]).range([0, width]);
    const yScale = scaleLinear().domain([min, max]).range([height, 0]);

    const lineGenerator = d3Line<number>()
      .x((_, index) => xScale(index))
      .y((value) => yScale(value))
      .curve(curveMonotoneX);

    svg
      .append("path")
      .datum(points)
      .attr("fill", "none")
      .attr("stroke", "currentColor")
      .attr("stroke-width", 2.4)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("d", lineGenerator(points) ?? "")
      .style("filter", "drop-shadow(0px 1px 2px rgba(15,23,42,0.25))");
  }, [points]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 100 40"
      className={className}
      role="img"
      aria-label={ariaLabel}
    />
  );
}

