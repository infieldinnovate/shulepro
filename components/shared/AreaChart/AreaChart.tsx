"use client";

import type { ReactNode } from "react";
import {
  ResponsiveContainer,
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
import type {
  ChartSeries,
  ChartAxisConfig,
  ChartDrillDownPayload,
} from "@/lib/chartTypes";
import { buildChartData, extractSeriesValue, formatChartValue } from "@/lib/chartTypes";
import shared from "@/components/shared/charts.shared.module.scss";
import styles from "./AreaChart.module.scss";

export interface AreaChartProps {
  title: string;
  description?: string;
  series: ChartSeries[];
  yAxis?: ChartAxisConfig;
  summary?: string;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  height?: string;
  /** Stack areas on top of each other. */
  stacked?: boolean;
  definition?: ReactNode;
  footer?: ReactNode;
  onDrillDown?: (payload: ChartDrillDownPayload) => void;
  className?: string;
  children?: ReactNode;
}



export function AreaChart({
  title,
  description,
  series,
  yAxis,
  summary,
  loading = false,
  error,
  empty = false,
  height = "18rem",
  stacked = false,
  definition,
  footer,
  onDrillDown,
  className,
  children,
}: AreaChartProps) {
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
    const last = points[points.length - 1];
    return `${title}: ${primary.name} latest value ${formatChartValue(last.value, yAxis?.unit)} across ${points.length} points.`;
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
      className={clsx(shared.chart, styles.areaChart, className)}
    >
      {series.length > 1 && (
        <div className={shared.legendSlot}>
          <ChartLegend items={legendItems} />
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <ReAreaChart
          data={data}
          margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
          onClick={
            onDrillDown
              ? (e) => {
                  if (e && typeof e === "object" && "activeLabel" in e) {
                    onDrillDown({
                      chartType: "area",
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
          <defs>
            {series.map((s, i) => {
              const colorToken = (s.color ??
                chartPalette[i % chartPalette.length]) as ChartColorToken;
              const color = resolveChartColor(colorToken);
              return (
                <linearGradient
                  key={s.key}
                  id={`area-grad-${s.key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.05} />
                </linearGradient>
              );
            })}
          </defs>
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
              formatChartValue(Array.isArray(val) ? val[0] : val, yAxis?.unit),
              "",
            ]}
          />
          {series.map((s, i) => {
            const colorToken = (s.color ??
              chartPalette[i % chartPalette.length]) as ChartColorToken;
            const color = resolveChartColor(colorToken);
            return (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stroke={color}
                fill={`url(#area-grad-${s.key})`}
                fillOpacity={1}
                strokeWidth={s.reference ? 1.5 : 2}
                strokeDasharray={s.reference ? "5 4" : undefined}
                stackId={stacked ? "1" : undefined}
                connectNulls={false}
                isAnimationActive={!reduced}
                onClick={
                  onDrillDown
                    ? (d) => {
                        onDrillDown({
                          chartType: "area",
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
        </ReAreaChart>
      </ResponsiveContainer>
      {footer && <div className={shared.footer}>{footer}</div>}
      {children}
    </ChartPanel>
  );
}
