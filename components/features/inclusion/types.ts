// ============================================================
// CBC Inclusion & Support domain types
// All categories, scales, statuses, and descriptors are
// configurable via props — no official Kenyan disability
// categories, health conditions, or diagnostic classifications
// are hardcoded here. Language is non-stigmatizing and
// non-diagnostic throughout.
// ============================================================

/** Status of a support plan. */
export type SupportPlanStatus =
  | "draft"
  | "active"
  | "under-review"
  | "completed"
  | "archived";

/** Status of an individual support goal within a plan. */
export type SupportGoalStatus =
  | "not-started"
  | "in-progress"
  | "achieved"
  | "partially-achieved"
  | "discontinued";

/** Status of an accommodation provision. */
export type AccommodationStatus =
  | "proposed"
  | "in-place"
  | "under-review"
  | "withdrawn";

/** Status of an assistive device assignment. */
export type AssistiveDeviceStatus =
  | "requested"
  | "issued"
  | "in-use"
  | "returned"
  | "needs-maintenance";

/** Severity of an accessibility barrier — configurable, not diagnostic. */
export type AccessibilitySeverity = "low" | "moderate" | "high";

/** Status of an accessibility issue resolution. */
export type AccessibilityIssueStatus =
  | "identified"
  | "being-addressed"
  | "resolved"
  | "monitoring";

/** Lifecycle status of an intervention. */
export type InterventionStatus =
  | "planned"
  | "active"
  | "paused"
  | "completed"
  | "discontinued";

/** Outcome of an intervention — configurable, non-diagnostic. */
export type InterventionOutcomeLabel =
  | "emerging"
  | "progressing"
  | "consistent"
  | "not-yet-evident"
  | "not-applicable";

/** Status of a referral. */
export type ReferralStatus =
  | "draft"
  | "submitted"
  | "acknowledged"
  | "in-progress"
  | "completed"
  | "declined";

/** Event type for a support plan timeline. */
export type SupportPlanTimelineEventType =
  | "created"
  | "updated"
  | "goal-added"
  | "goal-updated"
  | "goal-achieved"
  | "review-scheduled"
  | "review-completed"
  | "accommodation-added"
  | "accommodation-updated"
  | "accommodation-withdrawn"
  | "device-issued"
  | "device-returned"
  | "referral-made"
  | "note-added";

import type { PersonRef, LearnerRef } from "@/types";
export type { PersonRef, LearnerRef };

/** A configurable support plan for a learner. */
export interface SupportPlan {
  id: string;
  learnerRef: LearnerRef;
  title: string;
  /** Owner or coordinator (person id). */
  ownerRef?: PersonRef;
  status: SupportPlanStatus;
  /** Configurable summary text. */
  summary?: string;
  startDate?: Date | string;
  reviewDate?: Date | string;
  endDate?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/** An individual goal within a support plan. */
export interface SupportGoal {
  id: string;
  planId: string;
  label: string;
  description?: string;
  /** Baseline evidence description (non-diagnostic). */
  baselineEvidence?: string;
  /** Target description. */
  target?: string;
  /** Responsible person id. */
  responsibleRef?: PersonRef;
  /** Display name for the responsible person (provided by caller). */
  responsibleName?: string;
  /** Optional avatar source for the responsible person. */
  responsibleAvatarSrc?: string;
  /** Optional initials for the responsible person. */
  responsibleInitials?: string;
  reviewDate?: Date | string;
  status: SupportGoalStatus;
  /** Optional progress percentage (0-100). */
  progress?: number | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/** A configurable accommodation provided to a learner. */
export interface Accommodation {
  id: string;
  planId?: string;
  /** Configurable category label (e.g. "Assessment arrangement"). */
  category: string;
  description: string;
  /** Person responsible for providing the accommodation. */
  providerRef?: PersonRef;
  providerName?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  status: AccommodationStatus;
  /** Optional notes (non-stigmatizing). */
  notes?: string;
}

/** A configurable assistive device assigned to a learner. */
export interface AssistiveDevice {
  id: string;
  /** Device name (e.g. "Magnifier", "Communication aid"). */
  name: string;
  /** Configurable category label. */
  category?: string;
  /** Learner or person the device is assigned to. */
  assignedToRef?: LearnerRef | PersonRef;
  assignedToName?: string;
  /** Condition or usage notes (non-diagnostic). */
  notes?: string;
  issuedDate?: Date | string;
  status: AssistiveDeviceStatus;
}

/** An accessibility barrier identified for a learner or environment. */
export interface AccessibilityIssue {
  id: string;
  /** Configurable area label (e.g. "Classroom", "Digital materials"). */
  area: string;
  description: string;
  severity: AccessibilitySeverity;
  status: AccessibilityIssueStatus;
  /** Person responsible for addressing the issue. */
  ownerRef?: PersonRef;
  ownerName?: string;
  identifiedDate?: Date | string;
  resolvedDate?: Date | string;
  notes?: string;
}

/** A configurable measure of individual progress (non-diagnostic). */
export interface IndividualProgressMeasure {
  id: string;
  planId?: string;
  label: string;
  /** Current value. */
  value?: number | null;
  /** Target value. */
  target?: number | null;
  unit?: string;
  /** Pre-computed progress percentage (0-100). */
  progress?: number | null;
  /** Pre-computed trend direction. */
  trend?: "up" | "down" | "flat";
  /** Date of the measurement. */
  measuredAt?: Date | string;
  notes?: string;
}

/** An event in a support plan timeline. */
export interface SupportPlanTimelineEvent {
  id: string;
  planId: string;
  type: SupportPlanTimelineEventType;
  /** Display label for the event. */
  label: string;
  description?: string;
  /** Actor (person id) — display name provided by caller. */
  actorRef?: PersonRef;
  actorName?: string;
  occurredAt: Date | string;
}

/** A configurable intervention within a support plan. */
export interface Intervention {
  id: string;
  planId?: string;
  label: string;
  description?: string;
  /** Configurable strategy or approach label. */
  approach?: string;
  status: InterventionStatus;
  /** Outcome label (configurable, non-diagnostic). */
  outcome?: InterventionOutcomeLabel;
  startDate?: Date | string;
  endDate?: Date | string;
  /** Person responsible. */
  responsibleRef?: PersonRef;
  responsibleName?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/** A single tracker entry recording an intervention session or observation. */
export interface InterventionTrackerEntry {
  id: string;
  interventionId: string;
  /** Date of the entry. */
  recordedAt: Date | string;
  /** Observation notes (non-diagnostic). */
  notes?: string;
  /** Configurable outcome label for this entry. */
  outcomeLabel?: string;
  /** Person who recorded the entry. */
  recordedByRef?: PersonRef;
  recordedByName?: string;
}

/** A referral made on behalf of a learner. */
export interface Referral {
  id: string;
  learnerRef: LearnerRef;
  /** Configurable referral type label (e.g. "Educational assessment"). */
  type: string;
  /** Configurable recipient label (service, provider, or institution). */
  recipient: string;
  reason: string;
  status: ReferralStatus;
  submittedDate?: Date | string;
  acknowledgedDate?: Date | string;
  completedDate?: Date | string;
  /** Person who initiated the referral. */
  initiatedByRef?: PersonRef;
  initiatedByName?: string;
  notes?: string;
}

/** A status change event in a referral's lifecycle. */
export interface ReferralStatusEvent {
  id: string;
  referralId: string;
  status: ReferralStatus;
  label: string;
  description?: string;
  occurredAt: Date | string;
  actorRef?: PersonRef;
  actorName?: string;
}
