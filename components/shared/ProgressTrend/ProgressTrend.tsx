"use client";

import type { ReactNode } from "react";
import {
  ResponsiveContainer,
  LineChart as ReLineChart,
  Line,
  AreaChart as ReAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import clsx from "clsx";
import { ChartPanel } from "@/components/shared/ChartPanel";
import { ChartLegend } from "@/components/shared/ChartLegend";
import { useReducedMotion } from "@/lib/useReducedMotion";
import {
  chartPalette,
  resolveChartColor,
  type ChartColorToken,
} from "@/lib/chartColors";
import { computeTrend } from "@/lib/analytics";
import { buildChartData, formatChartValue } from "@/lib/chartTypes";
import shared from "@/components/shared/charts.shared.module.scss";
import styles from "./ProgressTrend.module.scss";

export interface TrendDataPoint {
  label: string;
  value: number | null | undefined;
}

export interface TrendSeries {
  key: string;
  name: string;
  data: TrendDataPoint[];
  color?: ChartColorToken | string;
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
  const reduced = useReducedMotion();
  const hasData =
    series.length > 0 && series.some((s) => s.data.length > 0);
  const showEmpty = empty || (!hasData && !loading && !error);

  const data = buildChartData(series);

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
      last.value != null ? formatChartValue(last.value, unit) : "no data";
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

  const legendItems = series.map((s, i) => ({
    key: s.key,
    name: s.name,
    color: (s.color ?? chartPalette[i % chartPalette.length]) as ChartColorToken,
  }));

  const hasArea = series.some((s) => s.area);
  const ChartComponent = hasArea ? ReAreaChart : ReLineChart;

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
      className={clsx(shared.chart, styles.progressTrend, className)}
    >
      {series.length > 1 && (
        <div className={shared.legendSlot}>
          <ChartLegend items={legendItems} />
        </div>
      )}
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
              formatChartValue(
                Array.isArray(val) ? val[0] : val,
                unit,
              ),
              "",
            ]}
          />
          {series.map((s, i) => {
            const colorToken = (s.color ??
              chartPalette[i % chartPalette.length]) as ChartColorToken;
            const color = resolveChartColor(colorToken);
            return s.area ? (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stroke={color}
                fill={color}
                fillOpacity={0.15}
                strokeWidth={s.reference ? 1.5 : 2}
                strokeDasharray={s.reference ? "5 4" : undefined}
                connectNulls={false}
                dot={{ r: 3, fill: color, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
                isAnimationActive={!reduced}
              />
            ) : (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stroke={color}
                strokeWidth={s.reference ? 1.5 : 2}
                strokeDasharray={s.reference ? "5 4" : undefined}
                connectNulls={false}
                dot={{ r: 3, fill: color, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
                isAnimationActive={!reduced}
              />
            );
          })}
        </ChartComponent>
      </ResponsiveContainer>
      {children}
    </ChartPanel>
  );
}
