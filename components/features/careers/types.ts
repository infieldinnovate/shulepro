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

// ============================================================
// Career clusters, pathways, explorer, and recommendations
// All cluster definitions, pathway requirements, and
// recommendation rules are configurable via props — no
// official CBC eligibility rules or pathway requirements
// are hardcoded here.
// ============================================================

/** A reference to a learning area (id or key). */
export type LearningAreaRef = string;

/** A reference to an interest dimension (matches CareerInterestDimension.key). */
export type InterestDimensionRef = string;

/** A reference to a career cluster (matches CareerCluster.key). */
export type CareerClusterRef = string;

/** A reference to a pathway (matches CareerPathway.key). */
export type CareerPathwayRef = string;

/** A sample occupation within a career cluster. */
export interface CareerOccupation {
  id: string;
  /** Human-readable occupation title. */
  label: string;
  /** Optional short description of the occupation. */
  description?: string;
}

/** A related learning area linked to a career cluster. */
export interface ClusterLearningArea {
  /** Matches a learning area id/key. */
  ref: LearningAreaRef;
  /** Display label for the learning area. */
  label: string;
}

/** A related interest dimension linked to a career cluster. */
export interface ClusterInterestLink {
  /** Matches an interest dimension key. */
  dimensionKey: InterestDimensionRef;
  /** Display label for the interest dimension. */
  label: string;
}

/**
 * A configurable career cluster — a group of related
 * occupations, learning areas, and interest dimensions.
 * NOT a hardcoded official pathway grouping.
 */
export interface CareerCluster {
  id: string;
  /** Stable key (e.g. "stem"). */
  key: CareerClusterRef;
  /** Human-readable cluster title. */
  label: string;
  /** Optional short description of the cluster. */
  description?: string;
  /** Related learning areas. */
  learningAreas: ClusterLearningArea[];
  /** Related interest dimensions. */
  interests: ClusterInterestLink[];
  /** Sample occupations within this cluster. */
  occupations: CareerOccupation[];
  /** Optional learner-fit summary (caller-supplied, non-binding). */
  fitSummary?: string;
  /** Optional fit confidence label (e.g. "Strong", "Exploring"). */
  fitConfidenceLabel?: string;
}

/** A configurable career pathway option. */
export interface CareerPathway {
  id: string;
  key: CareerPathwayRef;
  /** Human-readable pathway title. */
  label: string;
  /** Optional description of the pathway. */
  description?: string;
  /** Optional cluster this pathway belongs to. */
  clusterKey?: CareerClusterRef;
  /** Optional cluster display label (caller-supplied). */
  clusterLabel?: string;
  /** Optional related learning areas. */
  learningAreas?: ClusterLearningArea[];
  /** Optional related interest dimensions. */
  interests?: ClusterInterestLink[];
}

/** A filter facet for the CareerExplorer. */
export interface CareerExplorerFacet {
  /** Stable facet key (e.g. "cluster", "interest", "learningArea"). */
  key: string;
  /** Human-readable facet label. */
  label: string;
  /** Selectable options for this facet. */
  options: CareerChoiceOption[];
}

/** Active filter values for the CareerExplorer, keyed by facet key. */
export type CareerExplorerFilters = Record<string, string>;

/** A single career recommendation entry. */
export interface CareerRecommendation {
  id: string;
  /** Human-readable recommendation title (e.g. cluster or pathway name). */
  title: string;
  /** Optional description of the recommended option. */
  description?: string;
  /** Explicit, human-readable rationale for this recommendation. */
  rationale: string;
  /** Explicit limitations or caveats (e.g. missing inputs, low confidence). */
  limitations?: string[];
  /** Optional confidence label (caller-supplied, non-binding). */
  confidenceLabel?: string;
  /** Optional related cluster/pathway reference for drill-down. */
  targetRef?: string;
  /** Optional display label for the drill-down target. */
  targetLabel?: string;
}

/** Disclosed gaps in the inputs used to generate recommendations. */
export interface CareerRecommendationInputGap {
  id: string;
  /** Human-readable label for the missing or incomplete input. */
  label: string;
  /** Optional explanation of why this input matters. */
  explanation?: string;
}

