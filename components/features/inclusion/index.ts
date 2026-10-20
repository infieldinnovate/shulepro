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
