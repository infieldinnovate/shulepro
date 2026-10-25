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
import { extractSeriesValue } from "@/lib/chartTypes";
import shared from "@/components/shared/charts.shared.module.scss";
import styles from "./BarChart.module.scss";

export interface BarChartProps {
  title: string;
  description?: string;
  /** One or more series. When multiple, bars are grouped side-by-side. */
  series: ChartSeries[];
  /** Y-axis configuration (numeric axis). */
  yAxis?: ChartAxisConfig;
  /** X-axis unit/label. */
  xAxisLabel?: string;
  summary?: string;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  height?: string;
  /** Layout orientation. Defaults to vertical bars. */
  layout?: "vertical" | "horizontal";
  definition?: ReactNode;
  footer?: ReactNode;
  onDrillDown?: (payload: ChartDrillDownPayload) => void;
  className?: string;
  children?: ReactNode;
}

interface ChartDatum {
  xLabel: string;
  [seriesKey: string]: number | string | null;
}

function buildChartData(series: ChartSeries[]): ChartDatum[] {
  const xLabels: string[] = [];
  for (const s of series) {
    for (const pt of s.data) {
      if (!xLabels.includes(pt.label)) xLabels.push(pt.label);
    }
  }
  return xLabels.map((label) => {
    const datum: ChartDatum = { xLabel: label };
    for (const s of series) {
      const pt = s.data.find((p) => p.label === label);
      datum[s.key] = pt ? pt.value ?? null : null;
    }
    return datum;
  });
}

function formatValue(
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

export function BarChart({
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
  layout = "vertical",
  definition,
  footer,
  onDrillDown,
  className,
  children,
}: BarChartProps) {
  const reduced = useReducedMotion();
  const hasData = series.length > 0 && series.some((s) => s.data.length > 0);
  const showEmpty = empty || (!hasData && !loading && !error);

  const data = buildChartData(series);
  const horizontal = layout === "horizontal";

  const accessibleSummary = (() => {
    if (summary) return summary;
    const primary = series[0];
    if (!primary) return title;
    const points = primary.data.filter(
      (p) => p.value != null && !Number.isNaN(p.value),
    );
    if (points.length === 0) return `${title}: no data available.`;
    const max = points.reduce((m, p) => Math.max(m, p.value ?? -Infinity), -Infinity);
    const min = points.reduce((m, p) => Math.min(m, p.value ?? Infinity), Infinity);
    return `${title}: ${primary.name} ranging from ${formatValue(min, yAxis?.unit)} to ${formatValue(max, yAxis?.unit)} across ${points.length} categories.`;
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
      className={clsx(shared.chart, styles.barChart, className)}
    >
      {series.length > 1 && (
        <div className={shared.legendSlot}>
          <ChartLegend items={legendItems} />
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <ReBarChart
          data={data}
          layout={horizontal ? "vertical" : "horizontal"}
          margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
          onClick={
            onDrillDown
              ? (e) => {
                  if (e && typeof e === "object" && "activeLabel" in e) {
                    onDrillDown({
                      chartType: "bar",
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
            vertical={horizontal}
            horizontal={!horizontal}
          />
          {horizontal ? (
            <>
              <XAxis
                type="number"
                tick={{ fontSize: 12, fill: "var(--color-fg-muted)" }}
                tickLine={false}
                axisLine={{ stroke: "var(--color-border)" }}
                allowDecimals={yAxis?.allowDecimals ?? false}
                domain={yAxis?.domain ?? [0, "auto"]}
                label={
                  yAxis?.label
                    ? {
                        value: yAxis.label,
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
                type="category"
                dataKey="xLabel"
                tick={{ fontSize: 12, fill: "var(--color-fg-muted)" }}
                tickLine={false}
                axisLine={{ stroke: "var(--color-border)" }}
                width={90}
              />
            </>
          ) : (
            <>
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
            </>
          )}
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--font-size-sm)",
            }}
            labelStyle={{ color: "var(--color-fg)", fontWeight: 600 }}
            formatter={(val) => [
              formatValue(Array.isArray(val) ? val[0] : val, yAxis?.unit),
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
                fill={color}
                radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
                maxBarSize={48}
                isAnimationActive={!reduced}
                onClick={
                  onDrillDown
                    ? (d) => {
                        onDrillDown({
                          chartType: "bar",
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
