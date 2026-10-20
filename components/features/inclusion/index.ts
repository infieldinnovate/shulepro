// ============================================================
// CBC Inclusion & Support feature — barrel exports
// ============================================================

export type {
  SupportPlanStatus,
  SupportGoalStatus,
  AccommodationStatus,
  AssistiveDeviceStatus,
  AccessibilitySeverity,
  AccessibilityIssueStatus,
  InterventionStatus,
  InterventionOutcomeLabel,
  ReferralStatus,
  SupportPlanTimelineEventType,
  PersonRef,
  LearnerRef,
  SupportPlan,
  SupportGoal,
  Accommodation,
  AssistiveDevice,
  AccessibilityIssue,
  IndividualProgressMeasure,
  SupportPlanTimelineEvent,
  Intervention,
  InterventionTrackerEntry,
  Referral,
  ReferralStatusEvent,
} from "./types";

export { SupportPlanSummary } from "./SupportPlanSummary";
export type { SupportPlanSummaryProps } from "./SupportPlanSummary";

export { SupportGoalCard } from "./SupportGoalCard";
export type { SupportGoalCardProps } from "./SupportGoalCard";

export { AccommodationList } from "./AccommodationList";
export type { AccommodationListProps } from "./AccommodationList";

export { AssistiveDeviceCard } from "./AssistiveDeviceCard";
export type { AssistiveDeviceCardProps } from "./AssistiveDeviceCard";

export {
  AccessibilityIssueCard,
  DEFAULT_SEVERITY_BADGE_MAP,
  DEFAULT_ISSUE_STATUS_BADGE_MAP,
} from "./AccessibilityIssueCard";
export type {
  AccessibilityIssueCardProps,
  AccessibilitySeverityBadgeMap,
  AccessibilityIssueStatusBadgeMap,
} from "./AccessibilityIssueCard";

export { IndividualProgressPanel } from "./IndividualProgressPanel";
export type { IndividualProgressPanelProps } from "./IndividualProgressPanel";

export {
  SupportPlanTimeline,
  DEFAULT_TIMELINE_VARIANT_MAP,
} from "./SupportPlanTimeline";
export type {
  SupportPlanTimelineProps,
  SupportPlanTimelineVariantMap,
} from "./SupportPlanTimeline";

export {
  InterventionCard,
  DEFAULT_INTERVENTION_STATUS_MAP,
} from "./InterventionCard";
export type {
  InterventionCardProps,
  InterventionStatusBadgeMap,
} from "./InterventionCard";

export { InterventionTracker } from "./InterventionTracker";
export type { InterventionTrackerProps } from "./InterventionTracker";

export { ReferralForm } from "./ReferralForm";
export type {
  ReferralFormProps,
  ReferralFormData,
  ReferralFormOptions,
} from "./ReferralForm";

export {
  ReferralStatusTimeline,
  DEFAULT_REFERRAL_STATUS_MAP,
  DEFAULT_REFERRAL_TIMELINE_VARIANT_MAP,
} from "./ReferralStatusTimeline";
export type {
  ReferralStatusTimelineProps,
  ReferralStatusBadgeMap,
  ReferralTimelineVariantMap,
} from "./ReferralStatusTimeline";
