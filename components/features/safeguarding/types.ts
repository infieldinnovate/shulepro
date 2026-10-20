// ============================================================
// Safeguarding domain types
// All categories, statuses, risk levels, and urgency levels
// are configurable string unions — no hardcoded statutory
// thresholds or automated determinations. Language is neutral,
// non-stigmatizing, and respectful throughout.
// ============================================================

/** A reference to a learner by id. */
export type LearnerRef = string;

/** A reference to a person by id. */
export type PersonRef = string;

/** Configurable concern status (caller-defined union). */
export type SafeguardingConcernStatus = string;

/** Configurable case status (caller-defined union). */
export type SafeguardingCaseStatus = string;

/** Configurable risk level (caller-defined union). */
export type RiskLevel = string;

/** Configurable urgency level (caller-defined union). */
export type SafeguardingUrgency = string;

/** Configurable case timeline event type (caller-defined union). */
export type CaseTimelineEventType = string;

/** A safeguarding concern record. */
export interface SafeguardingConcern {
  id: string;
  learnerRef: LearnerRef;
  /** Configurable category label. */
  category: string;
  /** Person who reported the concern. */
  reportedByRef?: PersonRef;
  reportedByName?: string;
  reportedAt: Date | string;
  urgency: SafeguardingUrgency;
  status: SafeguardingConcernStatus;
  summary: string;
  /** Optional alleged source description (neutral). */
  allegedSource?: string;
  location?: string;
  witnesses?: string;
  /** Whether consent to share was given. */
  consentToShare?: boolean;
  assignedToRef?: PersonRef;
  assignedToName?: string;
}

/** A safeguarding case. */
export interface SafeguardingCase {
  id: string;
  caseRef: string;
  learnerRef: LearnerRef;
  status: SafeguardingCaseStatus;
  openedAt: Date | string;
  assignedToRef?: PersonRef;
  assignedToName?: string;
  riskLevel: RiskLevel;
  summary: string;
}

/** A risk review record. */
export interface RiskReview {
  id: string;
  caseId?: string;
  reviewDate: Date | string;
  reviewerRef?: PersonRef;
  reviewerName?: string;
  riskLevel: RiskLevel;
  /** Configurable contributing factors (caller-supplied). */
  factors: string[];
  rationale: string;
  nextReviewDate?: Date | string;
}

/** An event in a case timeline. */
export interface CaseTimelineEvent {
  id: string;
  caseId: string;
  type: CaseTimelineEventType;
  label: string;
  description?: string;
  actorRef?: PersonRef;
  actorName?: string;
  occurredAt: Date | string;
}

/** A case follow-up record. */
export interface CaseFollowUp {
  id: string;
  caseId: string;
  followUpDate: Date | string;
  actionTaken: string;
  outcome: string;
  followedUpByRef?: PersonRef;
  followedUpByName?: string;
  nextStep?: string;
  statusUpdate?: SafeguardingCaseStatus;
}

/** A bullying incident record. */
export interface BullyingIncident {
  id: string;
  learnerRef: LearnerRef;
  incidentDate: Date | string;
  location?: string;
  /** Configurable type label. */
  type: string;
  description: string;
  partiesInvolved?: string;
  reporterName?: string;
  actionsTaken?: string;
  followUpRequired?: boolean;
  createdAt?: Date | string;
}
