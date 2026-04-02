"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "@/lib/utils/cn";

export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode;
    color?: string;
  };
};

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("Chart components must be used inside <ChartContainer />.");
  }

  return context;
}

export function ChartContainer({
  children,
  className,
  config,
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ReactNode;
}) {
  const style = React.useMemo(() => {
    return Object.fromEntries(
      Object.entries(config).flatMap(([key, value]) =>
        value.color ? [[`--color-${key}`, value.color]] : [],
      ),
    ) as React.CSSProperties;
  }, [config]);

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-text]:fill-muted-foreground [&_.recharts-tooltip-wrapper]:outline-none",
          className,
        )}
        data-slot="chart"
        style={style}
      >
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

export const ChartTooltip = RechartsPrimitive.Tooltip;

type ChartTooltipContentProps = {
  active?: boolean;
  className?: string;
  formatter?: (
    value: unknown,
    name: unknown,
    item: {
      color?: string;
      dataKey?: string | number;
      name?: string | number;
      value?: unknown;
    },
    index: number,
    payload: ReadonlyArray<{
      color?: string;
      dataKey?: string | number;
      name?: string | number;
      value?: unknown;
    }>,
  ) => React.ReactNode;
  hideLabel?: boolean;
  label?: React.ReactNode;
  labelFormatter?: (
    label: React.ReactNode,
    payload: ReadonlyArray<{
      color?: string;
      dataKey?: string | number;
      name?: string | number;
      value?: unknown;
    }>,
  ) => React.ReactNode;
  payload?: ReadonlyArray<{
    color?: string;
    dataKey?: string | number;
    name?: string | number;
    value?: unknown;
  }>;
};

export function ChartTooltipContent({
  active,
  className,
  formatter,
  hideLabel = false,
  label,
  labelFormatter,
  payload,
}: ChartTooltipContentProps) {
  const { config } = useChart();

  if (!active || !payload?.length) {
    return null;
  }

  const tooltipLabel =
    !hideLabel && label
      ? labelFormatter?.(label, payload) ?? label
      : null;

  return (
    <div className={cn("grid min-w-[180px] gap-2 rounded-2xl border border-border/80 bg-card/95 px-4 py-3 shadow-2xl shadow-black/20 backdrop-blur", className)}>
      {tooltipLabel ? <div className="text-xs text-muted-foreground">{tooltipLabel}</div> : null}
      <div className="grid gap-2">
        {payload.map((item, index) => {
          const key = String(item.dataKey ?? item.name ?? index);
          const itemConfig = config[key];

          return (
            <div key={key} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor: item.color ?? itemConfig?.color ?? "var(--primary)",
                  }}
                />
                <span className="text-xs text-muted-foreground">
                  {itemConfig?.label ?? item.name}
                </span>
              </div>
              <span className="text-sm font-medium text-foreground">
                {formatter ? formatter(item.value, item.name, item, index, payload) : String(item.value ?? "")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ChartLegendContent({
  className,
  payload,
}: React.ComponentProps<"div"> & {
  payload?: ReadonlyArray<RechartsPrimitive.LegendPayload>;
}) {
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {payload.map((item) => {
        const key = String(item.dataKey ?? item.value ?? "");
        const itemConfig = config[key];

        return (
          <div key={key} className="flex items-center gap-2 text-xs text-muted-foreground">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{
                backgroundColor:
                  typeof item.color === "string"
                    ? item.color
                    : itemConfig?.color ?? "var(--primary)",
              }}
            />
            <span>{itemConfig?.label ?? item.value}</span>
          </div>
        );
      })}
    </div>
  );
}
