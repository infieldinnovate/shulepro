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
  ProjectPhase,
  PerformanceTask,
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

export { RubricBuilder, DEFAULT_SCORING_RULE_OPTIONS } from "./RubricBuilder";
export type { RubricBuilderProps } from "./RubricBuilder";

export { RubricScoringGrid } from "./RubricScoringGrid";
export type {
  RubricScoringGridProps,
  RubricJudgements,
  RubricEvidenceOverrides,
} from "./RubricScoringGrid";

export {
  ObservationEntryForm,
  DEFAULT_EVIDENCE_STATUS_OPTIONS,
} from "./ObservationEntryForm";
export type {
  ObservationEntryFormProps,
  ObservationFormData,
} from "./ObservationEntryForm";

export { ProjectAssessmentPanel } from "./ProjectAssessmentPanel";
export type { ProjectAssessmentPanelProps } from "./ProjectAssessmentPanel";

export { PerformanceTaskForm } from "./PerformanceTaskForm";
export type {
  PerformanceTaskFormProps,
  PerformanceTaskFormData,
} from "./PerformanceTaskForm";

export { EvidenceUploader } from "./EvidenceUploader";
export type { EvidenceUploaderProps } from "./EvidenceUploader";

export { PortfolioGallery } from "./PortfolioGallery";
export type { PortfolioGalleryProps, PortfolioGroupBy } from "./PortfolioGallery";
