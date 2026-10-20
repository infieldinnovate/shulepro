// Reusable pure utilities, formatting helpers, validation helpers,
// and analytical calculations. No side effects, no I/O.

export { formatRelativeTime, formatAbsolute } from "./formatTime";

export {
  computeTrend,
  formatDelta,
  formatPercentChange,
  computeTargetProgress,
  classifyDataPoint,
  computeBenchmarkDelta,
  formatBenchmarkDelta,
} from "./analytics";

export type {
  TrendDirection,
  TrendResult,
  TargetStatus,
  TargetResult,
  DataPresence,
  BenchmarkResult,
} from "./analytics";
