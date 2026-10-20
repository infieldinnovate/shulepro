// ============================================================
// CBC Assessment feature — barrel exports
// ============================================================

export type {
  AttainmentLevel,
  AssessmentStatus,
  EvidenceStatus,
  LearningAreaRef,
  AssessmentActivity,
  RubricCriterion,
  AttainmentDescriptor,
  Rubric,
  AssessmentSubmission,
  ObservationEntry,
  AssessmentFeedback,
  ModerationFinding,
  EvidenceItem,
} from "./types";

export { AssessmentStatusBadge, DEFAULT_ASSESSMENT_STATUS_MAP } from "./AssessmentStatusBadge";
export type {
  AssessmentStatusBadgeProps,
  AssessmentStatusBadgeMap,
} from "./AssessmentStatusBadge";

export { AssessmentActivityCard } from "./AssessmentActivityCard";
export type { AssessmentActivityCardProps } from "./AssessmentActivityCard";

export { AssessmentBuilder } from "./AssessmentBuilder";
export type {
  AssessmentBuilderProps,
  AssessmentBuilderData,
  AttainmentLevelFormEntry,
} from "./AssessmentBuilder";
