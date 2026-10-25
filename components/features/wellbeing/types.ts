// ============================================================
// Wellbeing domain types
// Scales, prompts, and descriptors are configurable via props.
// No hardcoded wellbeing bands, diagnostic thresholds, or
// clinical screening instruments. Language is non-stigmatizing
// and non-clinical throughout.
// ============================================================

/** Type of response a wellbeing prompt expects. */
export type WellbeingPromptType = "rating" | "text" | "choice";

import type { LearnerRef, PersonRef } from "@/types";
export type { LearnerRef, PersonRef };

/** A configurable choice option for "choice" prompts. */
export interface WellbeingChoiceOption {
  value: string;
  label: string;
}

/** A configurable rating scale option for "rating" prompts. */
export interface WellbeingRatingOption {
  value: string;
  label: string;
  /** Optional numeric value for trend aggregation (caller-supplied). */
  numericValue?: number;
}

/** A configurable prompt presented during a wellbeing check-in. */
export interface WellbeingPrompt {
  id: string;
  /** The question text (non-clinical, non-diagnostic). */
  question: string;
  type: WellbeingPromptType;
  /** Options for "rating" prompts. */
  ratingOptions?: WellbeingRatingOption[];
  /** Options for "choice" prompts. */
  choices?: WellbeingChoiceOption[];
  /** Whether the prompt requires a response. */
  required?: boolean;
  /** Optional helper text shown with the prompt. */
  helperText?: string;
}

/** A recorded wellbeing check-in for a learner. */
export interface WellbeingCheckIn {
  id: string;
  learnerRef: LearnerRef;
  /** Date of the check-in. */
  date: Date | string;
  /** Responses keyed by prompt id. */
  responses: Record<string, string>;
  /** Optional free-text notes. */
  notes?: string;
  /** Person who recorded the check-in. */
  recordedByRef?: PersonRef;
  recordedByName?: string;
  createdAt?: Date | string;
}

/** A single aggregated point in a wellbeing trend series. */
export interface WellbeingTrendPoint {
  /** X-axis label (e.g. date or week label). */
  label: string;
  /** Aggregated numeric value (caller-supplied, pre-computed). */
  value: number | null;
}

/** An aggregated wellbeing trend series (caller-supplied). */
export interface WellbeingTrendSeries {
  /** Stable unique key. */
  key: string;
  /** Human-readable series name. */
  name: string;
  /** Pre-aggregated data points. */
  data: WellbeingTrendPoint[];
  /** Chart color token from the chart palette. */
  color?: string;
  /** Render as an area chart instead of a line chart. */
  area?: boolean;
  /** Render as a dashed reference line. */
  reference?: boolean;
}

/** Form values produced by the WellbeingCheckInForm. */
export interface WellbeingCheckInFormValues {
  date: string;
  responses: Record<string, string>;
  notes: string;
  recordedBy: string;
}
