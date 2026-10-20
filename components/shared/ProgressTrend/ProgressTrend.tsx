"use client";

import type { ReactNode } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import clsx from "clsx";
import { ChartPanel } from "../ChartPanel";
import { computeTrend } from "@/lib/analytics";
import styles from "./ProgressTrend.module.scss";

export interface TrendDataPoint {
  label: string;
  value: number | null | undefined;
}

export interface TrendSeries {
  key: string;
  name: string;
  data: TrendDataPoint[];
  color: string;
  area?: boolean;
  reference?: boolean;
}

export interface ProgressTrendProps {
  title: string;
  series: TrendSeries[];
  description?: string;
  yAxisLabel?: string;
  unit?: string;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  height?: string;
  summary?: string;
  definition?: ReactNode;
  className?: string;
  children?: ReactNode;
}

interface ChartDatum {
  xLabel: string;
  [seriesKey: string]: number | string | null;
}

function buildChartData(series: TrendSeries[]): {
  data: ChartDatum[];
  xLabels: string[];
} {
  const xLabels: string[] = [];
  for (const s of series) {
    for (const pt of s.data) {
      if (!xLabels.includes(pt.label)) xLabels.push(pt.label);
    }
  }
  const data: ChartDatum[] = xLabels.map((label) => {
    const datum: ChartDatum = { xLabel: label };
    for (const s of series) {
      const pt = s.data.find((p) => p.label === label);
      datum[s.key] = pt ? pt.value ?? null : null;
    }
    return datum;
  });
  return { data, xLabels };
}

function formatTooltipValue(
  value: number | string | null | undefined,
  unit?: string,
): string {
  if (value == null || (typeof value === "number" && Number.isNaN(value))) {
    return "No data";
  }
  const n = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(n)) return "No data";
  const u = unit ? ` ${unit}` : "";
  return Number.isInteger(n) ? `${n}${u}` : `${n.toFixed(1)}${u}`;
}

export function ProgressTrend({
  title,
  series,
  description,
  yAxisLabel,
  unit,
  loading = false,
  error,
  empty = false,
  height = "18rem",
  summary,
  definition,
  className,
  children,
}: ProgressTrendProps) {
  const hasData =
    series.length > 0 && series.some((s) => s.data.length > 0);
  const showEmpty = empty || (!hasData && !loading && !error);

  const { data } = buildChartData(series);

  const accessibleSummary = (() => {
    if (summary) return summary;
    const primary = series.find((s) => !s.reference) ?? series[0];
    const reference = series.find((s) => s.reference);
    if (!primary) return title;
    const last = primary.data[primary.data.length - 1];
    const prev = primary.data[primary.data.length - 2];
    if (!last) return title;
    const trend = computeTrend(last.value, prev?.value);
    const lastVal =
      last.value != null ? formatTooltipValue(last.value, unit) : "no data";
    if (trend.direction == null) {
      return `${title}: ${primary.name} latest value ${lastVal}. No comparable reference.`;
    }
    const dirWord =
      trend.direction === "up"
        ? "up"
        : trend.direction === "down"
          ? "down"
          : "flat";
    const refName = reference ? reference.name : "previous point";
    return `${title}: ${primary.name} latest value ${lastVal}, trend ${dirWord} compared to ${refName}.`;
  })();

  const hasArea = series.some((s) => s.area);
  const ChartComponent = hasArea ? AreaChart : LineChart;

  return (
    <ChartPanel
      title={title}
      description={description}
      summary={accessibleSummary}
      loading={loading}
      error={error}
      empty={showEmpty}
      definition={definition}
      height={height}
      className={clsx(styles.progressTrend, className)}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent
          data={data}
          margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border)"
            vertical={false}
          />
          <XAxis
            dataKey="xLabel"
            tick={{ fontSize: 12, fill: "var(--color-fg-muted)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--color-border)" }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "var(--color-fg-muted)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--color-border)" }}
            label={
              yAxisLabel
                ? {
                    value: yAxisLabel,
                    angle: -90,
                    position: "insideLeft",
                    style: {
                      fontSize: 12,
                      fill: "var(--color-fg-muted)",
                      textAnchor: "middle",
                    },
                  }
                : undefined
            }
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--font-size-sm)",
            }}
            labelStyle={{ color: "var(--color-fg)", fontWeight: 600 }}
            formatter={(val) => [
              formatTooltipValue(
                Array.isArray(val) ? val[0] : val,
                unit,
              ),
              "",
            ]}
          />
          {series.length > 1 && (
            <Legend
              wrapperStyle={{ fontSize: 12, color: "var(--color-fg-muted)" }}
              iconType="line"
            />
          )}
          {series.map((s) =>
            s.area ? (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stroke={s.color}
                fill={s.color}
                fillOpacity={0.15}
                strokeWidth={s.reference ? 1.5 : 2}
                strokeDasharray={s.reference ? "5 4" : undefined}
                connectNulls={false}
                dot={{ r: 3, fill: s.color, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
                isAnimationActive={true}
              />
            ) : (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stroke={s.color}
                strokeWidth={s.reference ? 1.5 : 2}
                strokeDasharray={s.reference ? "5 4" : undefined}
                connectNulls={false}
                dot={{ r: 3, fill: s.color, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
                isAnimationActive={true}
              />
            ),
          )}
        </ChartComponent>
      </ResponsiveContainer>
      {children}
    </ChartPanel>
  );
}
