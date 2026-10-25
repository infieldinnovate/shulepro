"use client";

import type { ReactNode } from "react";
import clsx from "clsx";
import { ChartPanel } from "@/components/shared/ChartPanel";
import { useReducedMotion } from "@/lib/useReducedMotion";
import type { ChartDrillDownPayload } from "@/lib/chartTypes";
import shared from "@/components/shared/charts.shared.module.scss";
import styles from "./HeatmapChart.module.scss";

/**
 * Maps a normalized value (0..1) to a CSS color string.
 * Provided by the caller — no scales are hardcoded in this component.
 */
export type HeatmapColorScale = (normalized: number) => string;

export interface HeatmapChartProps {
  title: string;
  description?: string;
  /** Flat list of cells; row/column labels are derived from this. */
  cells: { rowLabel: string; columnLabel: string; value: number | null | undefined }[];
  /** Caller-supplied color scale. Receives a 0..1 normalized value. */
  colorScale: HeatmapColorScale;
  /** Unit suffix for tooltip/cell display. */
  unit?: string;
  /** Show numeric values inside cells. Defaults to true. */
  showValues?: boolean;
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

function formatValue(
  value: number | null | undefined,
  unit?: string,
): string {
  if (value == null || Number.isNaN(value)) return "—";
  const u = unit ? ` ${unit}` : "";
  return Number.isInteger(value) ? `${value}${u}` : `${value.toFixed(1)}${u}`;
}

const emptyColor = "var(--color-surface-muted)";

export function HeatmapChart({
  title,
  description,
  cells,
  colorScale,
  unit,
  showValues = true,
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
}: HeatmapChartProps) {
  const reduced = useReducedMotion();
  const hasData = cells.length > 0;
  const showEmpty = empty || (!hasData && !loading && !error);

  const rowLabels: string[] = [];
  const columnLabels: string[] = [];
  for (const c of cells) {
    if (!rowLabels.includes(c.rowLabel)) rowLabels.push(c.rowLabel);
    if (!columnLabels.includes(c.columnLabel)) columnLabels.push(c.columnLabel);
  }

  const validValues = cells
    .map((c) => c.value)
    .filter((v): v is number => v != null && !Number.isNaN(v));
  const min = validValues.length > 0 ? Math.min(...validValues) : 0;
  const max = validValues.length > 0 ? Math.max(...validValues) : 0;
  const range = max - min;

  const cellMap = new Map<string, (typeof cells)[number]>();
  for (const c of cells) {
    cellMap.set(`${c.rowLabel}\0${c.columnLabel}`, c);
  }

  const accessibleSummary = (() => {
    if (summary) return summary;
    if (!hasData) return `${title}: no data available.`;
    return `${title}: ${rowLabels.length} rows by ${columnLabels.length} columns, values from ${formatValue(min, unit)} to ${formatValue(max, unit)}.`;
  })();

  function cellColor(value: number | null | undefined): string {
    if (value == null || Number.isNaN(value)) return emptyColor;
    if (range === 0) return colorScale(1);
    const normalized = (value - min) / range;
    return colorScale(normalized);
  }

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
      className={clsx(shared.chart, styles.heatmap, className)}
    >
      <div
        className={styles.grid}
        role="table"
        aria-label={accessibleSummary}
        style={{
          gridTemplateColumns: `minmax(5rem, auto) repeat(${columnLabels.length}, minmax(0, 1fr))`,
        }}
      >
        <div role="columnheader" className={styles.corner} aria-hidden="true" />
        {columnLabels.map((col) => (
          <div key={col} role="columnheader" className={styles.columnHeader}>
            {col}
          </div>
        ))}
        {rowLabels.map((row) => (
          <RowFragment
            key={row}
            row={row}
            columnLabels={columnLabels}
            cellMap={cellMap}
            cellColor={cellColor}
            formatValue={(v) => formatValue(v, unit)}
            showValues={showValues}
            reduced={reduced}
            onDrillDown={onDrillDown}
          />
        ))}
      </div>
      {footer && <div className={shared.footer}>{footer}</div>}
      {children}
    </ChartPanel>
  );
}

interface RowFragmentProps {
  row: string;
  columnLabels: string[];
  cellMap: Map<string, { rowLabel: string; columnLabel: string; value: number | null | undefined }>;
  cellColor: (value: number | null | undefined) => string;
  formatValue: (value: number | null | undefined) => string;
  showValues: boolean;
  reduced: boolean;
  onDrillDown?: (payload: ChartDrillDownPayload) => void;
}

function RowFragment({
  row,
  columnLabels,
  cellMap,
  cellColor,
  formatValue,
  showValues,
  reduced,
  onDrillDown,
}: RowFragmentProps) {
  return (
    <>
      <div role="rowheader" className={styles.rowHeader}>
        {row}
      </div>
      {columnLabels.map((col) => {
        const cell = cellMap.get(`${row}\0${col}`);
        const value = cell?.value;
        const color = cellColor(value);
        const label = `${row}, ${col}: ${formatValue(value)}`;
        return (
          <div
            key={`${row}-${col}`}
            role="cell"
            className={styles.cell}
            style={{ backgroundColor: color }}
            tabIndex={onDrillDown ? 0 : undefined}
            aria-label={label}
            title={label}
            onClick={
              onDrillDown
                ? () =>
                    onDrillDown({
                      chartType: "heatmap",
                      label: col,
                      rowLabel: row,
                      columnLabel: col,
                      value: value ?? null,
                    })
                : undefined
            }
            onKeyDown={
              onDrillDown
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onDrillDown({
                        chartType: "heatmap",
                        label: col,
                        rowLabel: row,
                        columnLabel: col,
                        value: value ?? null,
                      });
                    }
                  }
                : undefined
            }
            data-reduced={reduced || undefined}
          >
            {showValues && <span className={styles.cellValue}>{formatValue(value)}</span>}
          </div>
        );
      })}
    </>
  );
}
