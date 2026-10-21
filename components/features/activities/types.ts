// ============================================================
// Programmes & campaigns domain types
// All programme types, campaign objectives, audiences,
// activities, and outcome metrics are configurable via
// props — no hardcoded official programme frameworks,
// benchmark values, or target thresholds.
// ============================================================

/** Lifecycle status for a programme or campaign. */
export type ProgrammeStatus =
  | "planned"
  | "active"
  | "paused"
  | "completed"
  | "cancelled";

/** A configurable objective for a programme or campaign. */
export interface ProgrammeObjective {
  /** Stable identifier. */
  id: string;
  /** Human-readable objective label. */
  label: string;
  /** Optional description. */
  description?: string;
}

/** A configurable audience descriptor (e.g. "Grade 7 girls", "All staff"). */
export interface ProgrammeAudience {
  /** Stable identifier. */
  id: string;
  /** Human-readable audience label. */
  label: string;
  /** Optional description. */
  description?: string;
}

/** A configurable programme (STEM, mentorship, sports, clubs, etc.). */
export interface Programme {
  /** Stable identifier. */
  id: string;
  /** Human-readable programme name. */
  label: string;
  /** Optional description. */
  description?: string;
  /** Programme type label (e.g. "STEM", "Mentorship"). */
  type?: string;
  /** Configurable objectives. */
  objectives: ProgrammeObjective[];
  /** Configurable target audiences. */
  audiences: ProgrammeAudience[];
  /** Start date (ISO string or Date). */
  startDate?: string | Date;
  /** End date (ISO string or Date). */
  endDate?: string | Date;
  /** Lifecycle status. */
  status: ProgrammeStatus;
  /** Optional participant count. */
  participantCount?: number | null;
  /** Optional image URL. */
  imageSrc?: string;
}

/** A configurable campaign activity. */
export interface CampaignActivity {
  /** Stable identifier. */
  id: string;
  /** Human-readable activity label. */
  label: string;
  /** Optional description. */
  description?: string;
  /** Optional date the activity is scheduled or was completed. */
  date?: string | Date;
  /** Optional status for this activity. */
  status?: ProgrammeStatus;
}

/** A configurable campaign participant summary. */
export interface CampaignParticipantSummary {
  /** Total participants enrolled. */
  enrolled: number | null;
  /** Total participants actively engaged. */
  active: number | null;
  /** Total participants who completed. */
  completed: number | null;
  /** Optional unit label (e.g. "learners"). */
  unit?: string;
}

/** A configurable campaign target for progress tracking. */
export interface CampaignTarget {
  /** Stable identifier. */
  id: string;
  /** Human-readable target label (e.g. "Enrol 500 girls"). */
  label: string;
  /** Current value achieved. */
  current: number | null;
  /** Target value (caller-supplied, never fabricated). */
  target: number | null;
  /** Optional unit label. */
  unit?: string;
  /** Optional description. */
  description?: string;
}

/** A configurable campaign outcome measured against an objective. */
export interface CampaignOutcome {
  /** Stable identifier. */
  id: string;
  /** Human-readable outcome label. */
  label: string;
  /** Matches a ProgrammeObjective.id — the objective this outcome addresses. */
  objectiveId?: string;
  /** Outcome value achieved. */
  value: number | null;
  /** Optional reference/baseline value for comparison. */
  reference?: number | null;
  /** Optional unit label. */
  unit?: string;
  /** Whether outcome data is incomplete. */
  incomplete?: boolean;
  /** Optional description. */
  description?: string;
}

/** A configurable campaign. */
export interface Campaign {
  /** Stable identifier. */
  id: string;
  /** Human-readable campaign name. */
  label: string;
  /** Optional description. */
  description?: string;
  /** Configurable objectives. */
  objectives: ProgrammeObjective[];
  /** Configurable target audiences. */
  audiences: ProgrammeAudience[];
  /** Start date. */
  startDate?: string | Date;
  /** End date. */
  endDate?: string | Date;
  /** Configurable activities. */
  activities: CampaignActivity[];
  /** Participant summary. */
  participants?: CampaignParticipantSummary;
  /** Lifecycle status. */
  status: ProgrammeStatus;
  /** Configurable targets for progress tracking. */
  targets?: CampaignTarget[];
  /** Configurable outcomes. */
  outcomes?: CampaignOutcome[];
  /** Optional image URL. */
  imageSrc?: string;
}

// ============================================================
// Campaign form values
// ============================================================

export interface CampaignFormValues {
  label: string;
  description: string;
  startDate: string;
  endDate: string;
  status: ProgrammeStatus;
  objectiveIds: string[];
  audienceIds: string[];
  activityIds: string[];
  participantEnrolled: string;
  participantActive: string;
  participantCompleted: string;
}
