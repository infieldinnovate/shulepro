"use client";

import type { ReactNode } from "react";
import {
  ResponsiveContainer,
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import clsx from "clsx";
import { ChartPanel } from "../ChartPanel";
import { ChartLegend } from "../ChartLegend";
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
import shared from "../charts.shared.module.scss";
import styles from "./LineChart.module.scss";

export interface LineChartProps {
  title: string;
  /** Accessible short description of what the chart shows. */
  description?: string;
  /** One or more series. Each becomes a line. */
  series: ChartSeries[];
  /** Y-axis configuration. */
  yAxis?: ChartAxisConfig;
  /** Optional accessible summary; auto-derived when omitted. */
  summary?: string;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  /** Chart height (CSS length). Defaults to 18rem. */
  height?: string;
  /** Additional explanation shown in a tooltip/definition slot. */
  definition?: ReactNode;
  /** Optional footer content below the chart. */
  footer?: ReactNode;
  /** Fired when a data point is clicked. */
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

export function LineChart({
  title,
  description,
  series,
  yAxis,
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
}: LineChartProps) {
  const reduced = useReducedMotion();
  const hasData = series.length > 0 && series.some((s) => s.data.length > 0);
  const showEmpty = empty || (!hasData && !loading && !error);

  const data = buildChartData(series);

  const accessibleSummary = (() => {
    if (summary) return summary;
    const primary = series.find((s) => !s.reference) ?? series[0];
    if (!primary) return title;
    const points = primary.data.filter(
      (p) => p.value != null && !Number.isNaN(p.value),
    );
    if (points.length === 0) return `${title}: no data available.`;
    const first = points[0];
    const last = points[points.length - 1];
    const range =
      points.length > 1
        ? ` from ${formatValue(first.value, yAxis?.unit)} to ${formatValue(last.value, yAxis?.unit)} across ${points.length} points.`
        : ` value ${formatValue(last.value, yAxis?.unit)}.`;
    return `${title}: ${primary.name}${range}`;
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
      className={clsx(shared.chart, styles.lineChart, className)}
    >
      {series.length > 1 && (
        <div className={shared.legendSlot}>
          <ChartLegend items={legendItems} />
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <ReLineChart
          data={data}
          margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
          onClick={
            onDrillDown
              ? (e) => {
                  if (e && typeof e === "object" && "activeLabel" in e) {
                    onDrillDown({
                      chartType: "line",
                      label: String((e as { activeLabel: unknown }).activeLabel ?? ""),
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
          />
          <YAxis
            tick={{ fontSize: 12, fill: "var(--color-fg-muted)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--color-border)" }}
            allowDecimals={yAxis?.allowDecimals ?? false}
            domain={yAxis?.domain ?? ["auto", "auto"]}
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
              formatValue(Array.isArray(val) ? val[0] : val, yAxis?.unit),
              "",
            ]}
          />
          {series.map((s, i) => {
            const colorToken = (s.color ??
              chartPalette[i % chartPalette.length]) as ChartColorToken;
            const color = resolveChartColor(colorToken);
            return (
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
                onClick={
                  onDrillDown
                    ? (d) => {
                        onDrillDown({
                          chartType: "line",
                          label: String((d as { xLabel?: string })?.xLabel ?? ""),
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
        </ReLineChart>
      </ResponsiveContainer>
      {footer && <div className={shared.footer}>{footer}</div>}
      {children}
    </ChartPanel>
  );
}
