// Pure analytics calculation helpers. No React, no I/O, no fabricated data.
// Callers supply real figures via typed arguments; these functions never
// invent values, hardcode curriculum/grading scales, or claim improvement
// without a valid comparable reference.

/** Direction of a metric change vs a reference value. */
export type TrendDirection = "up" | "down" | "flat";

/**
 * Result of comparing a current value against a reference (e.g. previous
 * period). `direction` is `null` when there is no valid reference to compare
 * against, so callers never present a misleading "improvement".
 */
export interface TrendResult {
  direction: TrendDirection | null;
  /** Absolute difference (current - reference). `null` when no reference. */
  delta: number | null;
  /** Percentage change relative to the reference. `null` when no reference or reference is zero. */
  percentChange: number | null;
}

/**
 * Compare a current numeric value against a reference value.
 *
 * Returns `direction: null` when `reference` is `null`/`undefined`/`NaN` or
 * when `current` is `null`/`undefined`/`NaN`. This ensures callers can
 * distinguish "no comparable reference" from a genuine flat trend.
 *
 * `percentChange` is `null` when the reference is zero (division undefined).
 */
export function computeTrend(
  current: number | null | undefined,
  reference: number | null | undefined,
): TrendResult {
  const c = current ?? NaN;
  const r = reference ?? NaN;

  if (Number.isNaN(c) || Number.isNaN(r)) {
    return { direction: null, delta: null, percentChange: null };
  }

  const delta = c - r;

  if (r === 0) {
    const direction: TrendDirection =
      delta === 0 ? "flat" : delta > 0 ? "up" : "down";
    return { direction, delta, percentChange: null };
  }

  const percentChange = (delta / Math.abs(r)) * 100;
  let direction: TrendDirection = "flat";
  if (percentChange > 0) direction = "up";
  else if (percentChange < 0) direction = "down";

  return { direction, delta, percentChange };
}

/**
 * Format a signed numeric delta as a compact string (e.g. "+12.5", "-3").
 * Returns an empty string when the delta is `null`.
 */
export function formatDelta(
  delta: number | null,
  fractionDigits = 1,
): string {
  if (delta == null || Number.isNaN(delta)) return "";
  const sign = delta > 0 ? "+" : delta < 0 ? "\u2212" : "";
  const abs = Math.abs(delta);
  const rounded =
    abs % 1 === 0 ? abs.toFixed(0) : abs.toFixed(fractionDigits);
  return `${sign}${rounded}`;
}

/**
 * Format a percentage change value as a signed string (e.g. "+12.5%").
 * Returns `null` when `percentChange` is `null` (no valid reference).
 */
export function formatPercentChange(
  percentChange: number | null,
  fractionDigits = 1,
): string | null {
  if (percentChange == null || Number.isNaN(percentChange)) return null;
  const sign = percentChange > 0 ? "+" : percentChange < 0 ? "\u2212" : "";
  const abs = Math.abs(percentChange);
  const rounded =
    abs % 1 === 0 ? abs.toFixed(0) : abs.toFixed(fractionDigits);
  return `${sign}${rounded}%`;
}

/** Status of a value relative to a target. */
export type TargetStatus =
  | "on-track"
  | "at-risk"
  | "behind"
  | "exceeded"
  | "no-target";

/**
 * Result of comparing a current value against a target.
 * `progress` is clamped to [0, 100] when a target exists; `null` otherwise.
 */
export interface TargetResult {
  status: TargetStatus;
  /** Ratio of value to target, expressed as 0-100. `null` when no target. */
  progress: number | null;
  /** Raw ratio (value / target), may exceed 1. `null` when no target or target is zero. */
  ratio: number | null;
}

/**
 * Calculate progress toward a target.
 *
 * - `target` of `null`/`undefined`/`0`/`NaN` -> status `no-target`, progress `null`.
 * - `value` of `null`/`undefined`/`NaN` -> status `behind`, progress `0`.
 * - progress >= 100 -> `exceeded`.
 * - progress >= `onTrack` threshold (default 75) -> `on-track`.
 * - progress >= `atRisk` threshold (default 50) -> `at-risk`.
 * - below `atRisk` -> `behind`.
 */
export function computeTargetProgress(
  value: number | null | undefined,
  target: number | null | undefined,
  thresholds?: { onTrack?: number; atRisk?: number },
): TargetResult {
  const v = value ?? NaN;
  const t = target ?? NaN;

  if (t == null || Number.isNaN(t) || t === 0) {
    return { status: "no-target", progress: null, ratio: null };
  }

  if (v == null || Number.isNaN(v)) {
    return { status: "behind", progress: 0, ratio: null };
  }

  const ratio = v / t;
  const progress = Math.min(Math.max(ratio * 100, 0), 100);

  const onTrack = thresholds?.onTrack ?? 75;
  const atRisk = thresholds?.atRisk ?? 50;

  let status: TargetStatus;
  if (progress >= 100) status = "exceeded";
  else if (progress >= onTrack) status = "on-track";
  else if (progress >= atRisk) status = "at-risk";
  else status = "behind";

  return { status, progress, ratio };
}

/**
 * Distinguish between missing data, an actual zero value, and a real
 * (possibly poor) performance figure.
 */
export type DataPresence = "missing" | "zero" | "present";

export function classifyDataPoint(
  value: number | null | undefined,
): DataPresence {
  if (value == null || Number.isNaN(value)) return "missing";
  if (value === 0) return "zero";
  return "present";
}

/**
 * Result of comparing a value against a benchmark (e.g. class/cluster
 * average). Unlike a target, a benchmark is a reference point, not a goal.
 */
export interface BenchmarkResult {
  /** Absolute difference (value - benchmark). `null` when no benchmark. */
  delta: number | null;
  /** Difference as a percentage of the benchmark. `null` when no benchmark or benchmark is zero. */
  percentDelta: number | null;
  /** Whether the value is above, below, or equal to the benchmark. `null` when no benchmark. */
  direction: TrendDirection | null;
}

/**
 * Compare a value against a benchmark reference.
 *
 * Returns `direction: null` when `benchmark` is `null`/`undefined`/`NaN` or
 * when `value` is `null`/`undefined`/`NaN`.
 */
export function computeBenchmarkDelta(
  value: number | null | undefined,
  benchmark: number | null | undefined,
): BenchmarkResult {
  const v = value ?? NaN;
  const b = benchmark ?? NaN;

  if (Number.isNaN(v) || Number.isNaN(b)) {
    return { delta: null, percentDelta: null, direction: null };
  }

  const delta = v - b;
  const percentDelta = b === 0 ? null : (delta / Math.abs(b)) * 100;

  let direction: TrendDirection;
  if (delta > 0) direction = "up";
  else if (delta < 0) direction = "down";
  else direction = "flat";

  return { delta, percentDelta, direction };
}

/**
 * Format a benchmark delta as a signed, unit-aware string.
 * Returns `null` when there is no valid benchmark.
 */
export function formatBenchmarkDelta(
  result: BenchmarkResult,
  unit?: string,
  fractionDigits = 1,
): string | null {
  if (result.delta == null) return null;
  const formatted = formatDelta(result.delta, fractionDigits);
  const u = unit ? ` ${unit}` : "";
  return `${formatted}${u}`;
}
