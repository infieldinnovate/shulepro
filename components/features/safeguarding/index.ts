// ============================================================
// Safeguarding feature — barrel exports
// ============================================================

export type {
  LearnerRef,
  PersonRef,
  SafeguardingConcernStatus,
  SafeguardingCaseStatus,
  RiskLevel,
  SafeguardingUrgency,
  CaseTimelineEventType,
  SafeguardingConcern,
  SafeguardingCase,
  RiskReview,
  CaseTimelineEvent,
  CaseFollowUp,
  BullyingIncident,
} from "./types";

export { SafeguardingConcernForm } from "./SafeguardingConcernForm";
export type {
  SafeguardingConcernFormProps,
  SafeguardingConcernFormData,
  SafeguardingConcernFormOptions,
} from "./SafeguardingConcernForm";

export { SafeguardingCaseHeader } from "./SafeguardingCaseHeader";
export type {
  SafeguardingCaseHeaderProps,
  CaseStatusBadgeMap,
  RiskLevelBadgeMap,
} from "./SafeguardingCaseHeader";

export { RiskReviewPanel } from "./RiskReviewPanel";
export type { RiskReviewPanelProps } from "./RiskReviewPanel";

export { CaseTimeline } from "./CaseTimeline";
export type { CaseTimelineProps, CaseTimelineVariantMap } from "./CaseTimeline";

export { ConfidentialityBanner } from "./ConfidentialityBanner";
export type { ConfidentialityBannerProps } from "./ConfidentialityBanner";

export { RestrictedRecordView } from "./RestrictedRecordView";
export type { RestrictedRecordViewProps } from "./RestrictedRecordView";

export { BullyingIncidentForm } from "./BullyingIncidentForm";
export type {
  BullyingIncidentFormProps,
  BullyingIncidentFormData,
  BullyingIncidentFormOptions,
} from "./BullyingIncidentForm";

export { CaseFollowUpForm } from "./CaseFollowUpForm";
export type {
  CaseFollowUpFormProps,
  CaseFollowUpFormData,
  CaseFollowUpFormOptions,
} from "./CaseFollowUpForm";
