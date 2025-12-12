"use client";

import { ReactNode, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import {
  Area,
  AreaChart as ReAreaChart,
  Bar,
  BarChart as ReBarChart,
  CartesianGrid,
  Line,
  LineChart as ReLineChart,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/charts/chart-utils";

type ChartModalProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
};

export function ChartModal({
  open,
  title,
  description,
  onClose,
  children,
}: ChartModalProps) {
  useEffect(() => {
    if (!open) return undefined;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-10">
      <div
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-4xl rounded-[32px] border border-slate-100 bg-white p-6 shadow-2xl shadow-slate-900/40">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              Analytics insight
            </p>
            <h3 className="text-2xl font-semibold text-slate-900">{title}</h3>
            {description ? (
              <p className="mt-1 text-sm text-slate-600">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chart modal"
            className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-slate-400 hover:text-slate-900"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

type SparklineInteractiveProps = {
  points: number[];
  color?: string;
};

export function SparklineInteractive({
  points,
  color = "hsl(var(--chart-1))",
}: SparklineInteractiveProps) {
  const chartData = useMemo(
    () =>
      points.map((value, index) => ({
        label: `P${index + 1}`,
        value,
      })),
    [points],
  );

  return (
    <ChartContainer
      config={{
        value: {
          label: "Value",
          color,
        },
      }}
      className="bg-slate-50/80"
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ReLineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              className="text-xs text-slate-400"
            />
            <YAxis hide />
            <ReTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </ReLineChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}

type BarChartInteractiveProps = {
  data: { label: string; value: number }[];
};

export function BarChartInteractive({ data }: BarChartInteractiveProps) {
  return (
    <ChartContainer
      config={{
        value: { label: "Value", color: "hsl(var(--chart-1))" },
      }}
      className="bg-slate-50/80"
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ReBarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              className="text-xs text-slate-400"
            />
            <YAxis hide />
            <ReTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="var(--chart-1)" />
          </ReBarChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}

type AreaChartInteractiveProps = {
  points: number[];
  accentClass?: string;
};

export function AreaChartInteractive({
  points,
  accentClass = "text-indigo-500",
}: AreaChartInteractiveProps) {
  const chartData = useMemo(
    () =>
      points.map((value, index) => ({
        label: `P${index + 1}`,
        value,
      })),
    [points],
  );

  const strokeColor =
    accentClass === "text-indigo-500"
      ? "#6366f1"
      : accentClass === "text-emerald-500"
        ? "#10b981"
        : "hsl(var(--chart-1))";

  return (
    <ChartContainer
      config={{
        value: { label: "Value", color: strokeColor },
      }}
      className="bg-slate-50/80"
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ReAreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              className="text-xs text-slate-400"
            />
            <YAxis hide />
            <ReTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={strokeColor}
              fill={strokeColor}
              fillOpacity={0.2}
              strokeWidth={3}
            />
          </ReAreaChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}

