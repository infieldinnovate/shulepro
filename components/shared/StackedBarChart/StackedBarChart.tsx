"use client";

import type { ReactNode } from "react";
import {
  ResponsiveContainer,
  BarChart as ReBarChart,
  Bar,
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
import type {
  ChartSeries,
  ChartAxisConfig,
  ChartDrillDownPayload,
} from "@/lib/chartTypes";
import { buildChartData, extractSeriesValue, formatChartValue } from "@/lib/chartTypes";
import shared from "@/components/shared/charts.shared.module.scss";
import styles from "./StackedBarChart.module.scss";

export interface StackedBarChartProps {
  title: string;
  description?: string;
  /** Series stacked on top of each other. */
  series: ChartSeries[];
  yAxis?: ChartAxisConfig;
  xAxisLabel?: string;
  summary?: string;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  height?: string;
  definition?: ReactNode;
  footer?: ReactNode;
  onDrillDown?: (payload: ChartDrillDownPayload) => void;
  className?: string;
  children?: ReactNode;
}



export function StackedBarChart({
  title,
  description,
  series,
  yAxis,
  xAxisLabel,
  summary,
  loading = false,
  error,
  empty = false,
  height = "18rem",
  definition,
  footer,
  onDrillDown,
  className,
  children,
}: StackedBarChartProps) {
  const reduced = useReducedMotion();
  const hasData = series.length > 0 && series.some((s) => s.data.length > 0);
  const showEmpty = empty || (!hasData && !loading && !error);

  const data = buildChartData(series);

  const accessibleSummary = (() => {
    if (summary) return summary;
    const primary = series[0];
    if (!primary) return title;
    const categories = primary.data.length;
    return `${title}: ${series.length} stacked series across ${categories} categories.`;
  })();

  const legendItems = series.map((s, i) => ({
    key: s.key,
    name: s.name,
    color: (s.color ?? chartPalette[i % chartPalette.length]) as ChartColorToken,
  }));

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
      className={clsx(shared.chart, styles.stackedBarChart, className)}
    >
      {series.length > 1 && (
        <div className={shared.legendSlot}>
          <ChartLegend items={legendItems} />
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <ReBarChart
          data={data}
          margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
          onClick={
            onDrillDown
              ? (e) => {
                  if (e && typeof e === "object" && "activeLabel" in e) {
                    onDrillDown({
                      chartType: "stacked-bar",
                      label: String(
                        (e as { activeLabel: unknown }).activeLabel ?? "",
                      ),
                      raw: e,
                    });
                  }
                }
              : undefined
          }
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
            label={
              xAxisLabel
                ? {
                    value: xAxisLabel,
                    position: "insideBottom",
                    offset: -2,
                    style: {
                      fontSize: 12,
                      fill: "var(--color-fg-muted)",
                      textAnchor: "middle",
                    },
                  }
                : undefined
            }
          />
          <YAxis
            tick={{ fontSize: 12, fill: "var(--color-fg-muted)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--color-border)" }}
            allowDecimals={yAxis?.allowDecimals ?? false}
            domain={yAxis?.domain ?? [0, "auto"]}
            label={
              yAxis?.label
                ? {
                    value: yAxis.label,
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
              formatChartValue(Array.isArray(val) ? val[0] : val, yAxis?.unit),
              "",
            ]}
          />
          {series.map((s, i) => {
            const colorToken = (s.color ??
              chartPalette[i % chartPalette.length]) as ChartColorToken;
            const color = resolveChartColor(colorToken);
            return (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={s.name}
                stackId="1"
                fill={color}
                radius={[0, 0, 0, 0]}
                maxBarSize={48}
                isAnimationActive={!reduced}
                onClick={
                  onDrillDown
                    ? (d) => {
                        onDrillDown({
                          chartType: "stacked-bar",
                          label: String(
                            (d as { xLabel?: string })?.xLabel ?? "",
                          ),
                          seriesKey: s.key,
                          value: extractSeriesValue(d, s.key),
                          raw: d,
                        });
                      }
                    : undefined
                }
              />
            );
          })}
        </ReBarChart>
      </ResponsiveContainer>
      {footer && <div className={shared.footer}>{footer}</div>}
      {children}
    </ChartPanel>
  );
}
