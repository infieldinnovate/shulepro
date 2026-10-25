import type { ChartColorToken } from "./chartColors";

/** A single labelled point in a chart series. */
export interface ChartDataPoint {
  /** Category or x-axis label (e.g. "Term 1", "2024"). */
  label: string;
  /** Numeric value, or null/undefined for missing data. */
  value: number | null | undefined;
}

/** A named series rendered as a line, bar, or area. */
export interface ChartSeries {
  /** Stable unique key — also used as the Recharts dataKey. */
  key: string;
  /** Human-readable series name shown in legend/tooltip. */
  name: string;
  /** Data points for this series. */
  data: ChartDataPoint[];
  /** Color token from the chart palette; auto-assigned if omitted. */
  color?: ChartColorToken;
  /** Render as a dashed reference/target line. */
  reference?: boolean;
}

/** A single proportional segment in a donut/pie chart. */
export interface ChartSegment {
  key: string;
  name: string;
  value: number;
  color?: ChartColorToken;
}

/** A single cell in a heatmap matrix. */
export interface HeatmapCell {
  rowLabel: string;
  columnLabel: string;
  value: number | null | undefined;
}

/** Axis configuration shared by cartesian charts. */
export interface ChartAxisConfig {
  /** Optional axis title (Y-axis label, rotated). */
  label?: string;
  /** Unit suffix appended to tick/tooltip values (e.g. "%"). */
  unit?: string;
  /** Force a numeric domain, e.g. [0, 100]. */
  domain?: [number, number] | [number, string];
  /** Show integer-only ticks. */
  allowDecimals?: boolean;
}

/** Safely extract a numeric series value from a Recharts click payload. */
export function extractSeriesValue(
  payload: unknown,
  seriesKey: string,
): number | null {
  if (payload == null || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  const v = record[seriesKey];
  return typeof v === "number" && !Number.isNaN(v) ? v : null;
}

/** Pivoted row format consumed by Recharts cartesian charts. */
export interface ChartDatum {
  xLabel: string;
  [seriesKey: string]: number | string | null;
}

/**
 * Pivot an array of series (each with labelled data points) into the
 * row-oriented `ChartDatum[]` format that Recharts expects.
 */
export function buildChartData<
  T extends {
    key: string;
    data: ReadonlyArray<{ label: string; value?: number | null }>;
  },
>(series: T[]): ChartDatum[] {
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

/**
 * Format a numeric chart value with an optional unit suffix.
 * Returns `missingLabel` (default "No data") for null/NaN values.
 */
export function formatChartValue(
  value: number | string | null | undefined,
  unit?: string,
  missingLabel = "No data",
): string {
  if (value == null || (typeof value === "number" && Number.isNaN(value))) {
    return missingLabel;
  }
  const n = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(n)) return missingLabel;
  const u = unit ? ` ${unit}` : "";
  return Number.isInteger(n) ? `${n}${u}` : `${n.toFixed(1)}${u}`;
}

/** Payload passed to onDrillDown callbacks. */
export interface ChartDrillDownPayload {
  /** Chart type that emitted the event. */
  chartType:
    | "line"
    | "bar"
    | "stacked-bar"
    | "area"
    | "donut"
    | "heatmap";
  /** Category/segment label the user clicked. */
  label: string;
  /** Series key (cartesian charts) or segment key (donut). */
  seriesKey?: string;
  /** Raw numeric value, if available. */
  value?: number | null;
  /** Row label (heatmap only). */
  rowLabel?: string;
  /** Column label (heatmap only). */
  columnLabel?: string;
  /** Original Recharts payload, when available. */
  raw?: unknown;
}
