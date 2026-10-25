// Reusable pure utilities, formatting helpers, validation helpers,
// and analytical calculations. No side effects, no I/O.

export {
  formatRelativeTime,
  formatAbsolute,
  formatDate,
  formatDateLong,
  formatDateMedium,
  formatDateTime,
  formatDateShort,
  formatTodayOrDate,
} from "./formatTime";

export {
  computeTrend,
  formatDelta,
  formatPercentChange,
  computeTargetProgress,
  classifyDataPoint,
  computeBenchmarkDelta,
  formatBenchmarkDelta,
} from "./analytics";

export {
  chartColorTokens,
  chartPalette,
  resolveChartColor,
} from "./chartColors";
export type { ChartColorToken } from "./chartColors";
export {
  buildChartData,
  formatChartValue,
  extractSeriesValue,
} from "./chartTypes";
export type {
  ChartDataPoint,
  ChartSeries,
  ChartSegment,
  ChartDatum,
  HeatmapCell,
  ChartAxisConfig,
  ChartDrillDownPayload,
} from "./chartTypes";

export { useReducedMotion } from "./useReducedMotion";

export type {
  TrendDirection,
  TrendResult,
  TargetStatus,
  TargetResult,
  DataPresence,
  BenchmarkResult,
} from "./analytics";
