// ============================================================
// CBC Careers & Pathways domain types
// All interest dimensions, strength categories, assessment
// scales, and goal statuses are configurable via props —
// no official CBC career scales, interest inventories, or
// grading bands are hardcoded here.
// ============================================================

/** A reference to a learner by id. */
export type LearnerRef = string;

/** A reference to a person by id. */
export type PersonRef = string;

/**
 * A configurable interest dimension for a career interest profile.
 * NOT a hardcoded inventory dimension — supplied by the caller.
 */
export interface CareerInterestDimension {
  /** Stable identifier (e.g. "dimension-1"). */
  key: string;
  /** Human-readable label. */
  label: string;
  /** Optional short label for compact display. */
  shortLabel?: string;
  /** Optional description of what this dimension represents. */
  description?: string;
  /** Configurable scale options for rating interest in this dimension. */
  scale: CareerInterestScaleOption[];
  /** Whether a rating for this dimension is required. */
  required?: boolean;
}

/** A configurable option on an interest rating scale. */
export interface CareerInterestScaleOption {
  /** Stable value (e.g. "1"). */
  value: string;
  /** Human-readable label. */
  label: string;
  /** Optional short label for compact display. */
  shortLabel?: string;
  /** Optional numeric value for aggregation (caller-supplied). */
  numericValue?: number;
  /** Optional description of what this level represents. */
  description?: string;
}

/** A learner's recorded response on a single interest dimension. */
export interface CareerInterestResponse {
  /** Matches a CareerInterestDimension.key. */
  dimensionKey: string;
  /** Matches a CareerInterestScaleOption.value. */
  value: string;
  /** Optional free-text rationale (non-clinical). */
  notes?: string;
  /** Date the response was recorded. */
  recordedAt?: Date | string;
}

/** A configurable career interest profile record for a learner. */
export interface CareerInterestProfileData {
  id: string;
  learnerRef: LearnerRef;
  /** Configurable dimensions assessed in this profile. */
  dimensions: CareerInterestDimension[];
  /** Responses keyed by dimension key. */
  responses: CareerInterestResponse[];
  /** Optional free-text summary of the interest profile. */
  summary?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/**
 * A configurable demonstrated-strength category.
 * Kept distinct from career interests — strengths describe
 * demonstrated capability, not preferences.
 */
export interface StrengthCategory {
  /** Stable identifier (e.g. "category-1"). */
  key: string;
  /** Human-readable label. */
  label: string;
  /** Optional short label for compact display. */
  shortLabel?: string;
  /** Optional description of what this category represents. */
  description?: string;
}

/** A demonstrated strength entry within a category. */
export interface StrengthEntry {
  id: string;
  /** Matches a StrengthCategory.key. */
  categoryKey: string;
  /** Human-readable description of the demonstrated strength. */
  description: string;
  /** Optional evidence reference (caller-supplied label or id). */
  evidenceRef?: string;
  /** Optional display label for the evidence source. */
  evidenceLabel?: string;
  /** Date the strength was recorded. */
  recordedAt?: Date | string;
  /** Person who recorded the strength. */
  recordedByRef?: PersonRef;
  recordedByName?: string;
}

/** A configurable demonstrated-strengths profile record for a learner. */
export interface StrengthsProfileData {
  id: string;
  learnerRef: LearnerRef;
  /** Configurable strength categories used in this profile. */
  categories: StrengthCategory[];
  /** Demonstrated strength entries. */
  strengths: StrengthEntry[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/**
 * A configurable prompt presented during a career assessment.
 * NOT a hardcoded inventory question — supplied by the caller.
 */
export interface CareerAssessmentPrompt {
  id: string;
  /** The question text. */
  question: string;
  type: "text" | "rating" | "choice";
  /** Options for "rating" prompts. */
  ratingOptions?: CareerInterestScaleOption[];
  /** Options for "choice" prompts. */
  choices?: CareerChoiceOption[];
  /** Whether the prompt requires a response. */
  required?: boolean;
  /** Optional helper text shown with the prompt. */
  helperText?: string;
}

/** A configurable choice option for "choice" career prompts. */
export interface CareerChoiceOption {
  value: string;
  label: string;
}

/** Lifecycle status of a career goal. */
export type CareerGoalStatus =
  | "not-started"
  | "in-progress"
  | "on-track"
  | "achieved"
  | "paused"
  | "discontinued";

/** A configurable career goal for a learner. */
export interface CareerGoal {
  id: string;
  learnerRef: LearnerRef;
  /** Human-readable goal title. */
  title: string;
  /** Optional description of the goal. */
  description?: string;
  status: CareerGoalStatus;
  /** Optional target description (e.g. "Apply to two STEM pathways"). */
  target?: string;
  /** Optional target date for the goal. */
  targetDate?: Date | string;
  /** Optional date the goal is scheduled for review. */
  reviewDate?: Date | string;
  /** Optional progress percentage (0-100, caller-supplied). */
  progress?: number | null;
  /** Person responsible for supporting the goal. */
  supporterRef?: PersonRef;
  supporterName?: string;
  supporterAvatarSrc?: string;
  supporterInitials?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/** Form values produced by the CareerAssessmentForm. */
export interface CareerAssessmentFormValues {
  responses: Record<string, string>;
  notes: string;
}
