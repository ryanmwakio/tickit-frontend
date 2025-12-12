"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import * as React from "react";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import type { TooltipProps } from "recharts";

export type ChartConfig = Record<
  string,
  {
    label?: string;
    color?: string;
  }
>;

type ChartContextValue = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextValue | null>(null);

export function useChartConfig() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChartConfig must be used within a ChartContainer");
  }
  return context.config;
}

type ChartContainerProps = {
  config: ChartConfig;
  className?: string;
  children: ReactNode;
};

export function ChartContainer({
  config,
  className,
  children,
}: ChartContainerProps) {
  const style = React.useMemo(() => {
    const cssVars: React.CSSProperties = {};
    Object.entries(config).forEach(([key, value], index) => {
      cssVars[`--chart-${index + 1}` as keyof React.CSSProperties] =
        value.color ?? `hsl(var(--chart-${index + 1}))`;
      cssVars[`--color-${key}` as keyof React.CSSProperties] =
        value.color ?? `hsl(var(--chart-${index + 1}))`;
    });
    return cssVars;
  }, [config]);

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        className={cn(
          "rounded-[32px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/60",
          className,
        )}
        style={style}
      >
        {children}
      </div>
    </ChartContext.Provider>
  );
}

export function ChartTooltip({
  content,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { content: ReactNode }) {
  return (
    <div
      {...props}
      className={cn(
        "rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 text-xs text-slate-600 shadow-lg shadow-slate-200/70 backdrop-blur",
        props.className,
      )}
    >
      {content}
    </div>
  );
}

export function ChartTooltipContent({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="space-y-1">
      {label ? (
        <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">{label}</p>
      ) : null}
      <div className="space-y-1">
        {payload.map((item) => (
          <div key={item.dataKey} className="flex items-center justify-between gap-4">
            <span className="text-xs text-slate-500">{item.name}</span>
            <span className="text-sm font-semibold text-slate-900">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

