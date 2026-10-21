// ============================================================
// Equity & participation domain types
// All equity indicators, metrics, denominators, and group
// definitions are configurable via props — no official CBC
// equity benchmarks or thresholds are hardcoded here.
// Figures are presented with supplied comparisons only;
// causation is never asserted from correlations.
// ============================================================

/** A reference to a learner group (e.g. "female", "grade-7"). */
export type EquityGroupRef = string;

/**
 * A configurable equity indicator — a metric with an
 * explicitly-defined numerator and denominator.
 * NOT a hardcoded official equity benchmark.
 */
export interface EquityIndicator {
  /** Stable identifier. */
  id: string;
  /** Human-readable indicator title (e.g. "Girls' enrolment rate"). */
  label: string;
  /** Optional description of what this indicator measures. */
  description?: string;
  /** The numerator value (e.g. number of girls enrolled). */
  numerator: number | null;
  /** The denominator value (e.g. total eligible girls). */
  denominator: number | null;
  /** Optional unit label (e.g. "%", "learners"). */
  unit?: string;
  /** Optional explicitly-defined benchmark value (caller-supplied). */
  benchmark?: number | null;
  /** Optional human-readable label for the benchmark source. */
  benchmarkLabel?: string;
  /** Optional target value (caller-supplied, non-binding). */
  target?: number | null;
  /** Optional target label. */
  targetLabel?: string;
  /**
   * Whether a higher value is better. Defaults to true.
   * Set false for rates where lower is better (e.g. dropout).
   */
  higherIsBetter?: boolean;
  /** Optional comparison note — presented as comparison only, never causation. */
  comparisonNote?: string;
}

/** Data availability status for a single group's participation. */
export type ParticipationDataStatus = "present" | "zero" | "missing";

/** A single group's participation in a breakdown. */
export interface ParticipationGroupEntry {
  /** Stable identifier for the group. */
  key: EquityGroupRef;
  /** Human-readable group label (e.g. "Female", "Grade 7"). */
  label: string;
  /** Optional sublabel for additional context. */
  sublabel?: string;
  /** Participation count or rate. */
  value: number | null;
  /** Optional unit (e.g. "%", "learners"). */
  unit?: string;
  /** Optional reference/comparison value (e.g. previous period). */
  reference?: number | null;
  /** Optional target value. */
  target?: number | null;
  /** Optional target label. */
  targetLabel?: string;
  /** Drill-down handler — caller decides navigation. */
  onDrillDown?: () => void;
}

/** A configurable dimension for the participation breakdown (e.g. "gender", "grade"). */
export interface ParticipationDimension {
  /** Stable identifier. */
  key: string;
  /** Human-readable dimension label (e.g. "Gender", "Grade level"). */
  label: string;
  /** Group entries within this dimension. */
  groups: ParticipationGroupEntry[];
  /** Optional summary note for this dimension. */
  summary?: string;
}
