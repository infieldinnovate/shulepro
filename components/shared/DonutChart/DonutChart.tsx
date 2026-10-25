"use client";

import type { ReactNode } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
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
import type { ChartSegment, ChartDrillDownPayload } from "@/lib/chartTypes";
import { formatChartValue } from "@/lib/chartTypes";
import shared from "@/components/shared/charts.shared.module.scss";
import styles from "./DonutChart.module.scss";

export interface DonutChartProps {
  title: string;
  description?: string;
  /** Proportional segments. Values must be non-negative. */
  segments: ChartSegment[];
  /** Unit suffix for tooltip/legend values. */
  unit?: string;
  summary?: string;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  height?: string;
  /** Show a legend below the chart. Defaults to true. */
  showLegend?: boolean;
  /** Show values in the legend. Defaults to true. */
  showLegendValues?: boolean;
  definition?: ReactNode;
  footer?: ReactNode;
  onDrillDown?: (payload: ChartDrillDownPayload) => void;
  className?: string;
  children?: ReactNode;
}

export function DonutChart({
  title,
  description,
  segments,
  unit,
  summary,
  loading = false,
  error,
  empty = false,
  height = "18rem",
  showLegend = true,
  showLegendValues = true,
  definition,
  footer,
  onDrillDown,
  className,
  children,
}: DonutChartProps) {
  const reduced = useReducedMotion();
  const total = segments.reduce((sum, s) => sum + (s.value || 0), 0);
  const hasData = segments.length > 0 && total > 0;
  const showEmpty = empty || (!hasData && !loading && !error);

  const accessibleSummary = (() => {
    if (summary) return summary;
    if (!hasData) return `${title}: no data available.`;
    const breakdown = segments
      .map((s) => {
        const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
        return `${s.name} ${pct}%`;
      })
      .join(", ");
    return `${title}: ${breakdown}.`;
  })();

  const legendItems = segments.map((s, i) => ({
    key: s.key,
    name: s.name,
    color: (s.color ?? chartPalette[i % chartPalette.length]) as ChartColorToken,
    value: showLegendValues ? formatChartValue(s.value, unit) : undefined,
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
      className={clsx(shared.chart, styles.donutChart, className)}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <Pie
            data={segments.map((s) => ({ name: s.name, value: s.value, key: s.key }))}
            dataKey="value"
            nameKey="name"
            innerRadius="55%"
            outerRadius="85%"
            paddingAngle={1}
            stroke="var(--color-surface)"
            strokeWidth={2}
            isAnimationActive={!reduced}
            onClick={
              onDrillDown
                ? (d) => {
                    onDrillDown({
                      chartType: "donut",
                      label: String((d as { name?: string })?.name ?? ""),
                      value: typeof (d as { value?: number })?.value === "number"
                        ? (d as { value: number }).value
                        : null,
                      raw: d,
                    });
                  }
                : undefined
            }
          >
            {segments.map((s, i) => {
              const colorToken = (s.color ??
                chartPalette[i % chartPalette.length]) as ChartColorToken;
              return (
                <Cell key={s.key} fill={resolveChartColor(colorToken)} />
              );
            })}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--font-size-sm)",
            }}
            labelStyle={{ color: "var(--color-fg)", fontWeight: 600 }}
            formatter={(val) => [
              formatChartValue(Array.isArray(val) ? val[0] : val, unit),
              "",
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
      {showLegend && (
        <div className={shared.legendSlot}>
          <ChartLegend items={legendItems} />
        </div>
      )}
      {footer && <div className={shared.footer}>{footer}</div>}
      {children}
    </ChartPanel>
  );
}
