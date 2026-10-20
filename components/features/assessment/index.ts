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
  CompetencyResult,
  ReflectionPrompt,
  ProgressReport,
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

export { CompetencyProgressCard } from "./CompetencyProgressCard";
export type {
  CompetencyProgressCardProps,
  ProgressMeasureStatus,
} from "./CompetencyProgressCard";

export { CompetencyMatrix } from "./CompetencyMatrix";
export type { AssessmentCompetencyMatrixProps } from "./CompetencyMatrix";

export { LearningOutcomeStatus } from "./LearningOutcomeStatus";
export type { LearningOutcomeStatusProps } from "./LearningOutcomeStatus";

export { LearningGapList } from "./LearningGapList";
export type {
  AssessmentLearningGapListProps,
  LearningGap as AssessmentLearningGap,
  LearningGapSeverity as AssessmentLearningGapSeverity,
  LearningGapScope as AssessmentLearningGapScope,
} from "./LearningGapList";

export { AssessmentFeedbackPanel } from "./AssessmentFeedbackPanel";
export type {
  AssessmentFeedbackPanelProps,
  FeedbackType,
} from "./AssessmentFeedbackPanel";

export { AssessmentModerationPanel } from "./AssessmentModerationPanel";
export type {
  AssessmentModerationPanelProps,
  CorrectionStatus,
} from "./AssessmentModerationPanel";

export { ProgressReportCard } from "./ProgressReportCard";
export type { ProgressReportCardProps } from "./ProgressReportCard";

export { LearnerReflectionForm } from "./LearnerReflectionForm";
export type { LearnerReflectionFormProps } from "./LearnerReflectionForm";

export { ParentProgressSummary } from "./ParentProgressSummary";
export type { ParentProgressSummaryProps } from "./ParentProgressSummary";
