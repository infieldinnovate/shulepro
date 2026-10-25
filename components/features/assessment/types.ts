// ============================================================
// CBC Assessment domain types
// All scales, descriptors, and curriculum content are
// configurable via props — no official Kenyan CBC assessment
// scales, grading bands, or descriptors are hardcoded here.
// ============================================================

/**
 * A configurable attainment level for an assessment scale.
 * NOT a hardcoded CBC scale — supplied by the caller.
 */
export interface AttainmentLevel {
  /** Stable identifier (e.g. "level-1"). */
  key: string;
  /** Human-readable label. */
  label: string;
  /** Optional short label for compact display. */
  shortLabel?: string;
  /** Optional description of what this level represents. */
  description?: string;
  /** Numeric sort order. */
  order: number;
}

/** Lifecycle status of an assessment activity. */
export type AssessmentStatus =
  | "not-assessed"
  | "in-progress"
  | "submitted"
  | "moderated"
  | "published"
  | "draft";

/**
 * Evidence status for an observation or submission.
 * "partially-demonstrated" is optional/configurable —
 * do not force it on all scales.
 */
export type EvidenceStatus =
  | "not-assessed"
  | "insufficient-evidence"
  | "not-yet-demonstrated"
  | "partially-demonstrated"
  | "demonstrated";

import type { LearningAreaRef } from "@/types";
export type { LearningAreaRef };

/** A CBC assessment activity. Configurable — no hardcoded scales. */
export interface AssessmentActivity {
  id: string;
  title: string;
  learningAreaRef: LearningAreaRef;
  description?: string;
  dueDate?: Date | string;
  status: AssessmentStatus;
  /** Configurable attainment levels for this activity. */
  attainmentLevels: AttainmentLevel[];
  /** References to competency/strand keys. */
  competencies: string[];
  /** Optional instructions for learners/teachers. */
  instructions?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/** A descriptor mapping an attainment level to a criterion. */
export interface AttainmentDescriptor {
  /** Matches an AttainmentLevel.key. */
  levelKey: string;
  description: string;
  /** Optional numeric score for this descriptor. */
  score?: number;
}

/** A single criterion within a rubric. */
export interface RubricCriterion {
  id: string;
  label: string;
  description?: string;
  descriptors: AttainmentDescriptor[];
  /** Optional weighting for this criterion. */
  weight?: number;
}

/** A rubric composed of criteria and attainment levels. */
export interface Rubric {
  id: string;
  title: string;
  criteria: RubricCriterion[];
  /** Configurable attainment levels for this rubric. */
  attainmentLevels: AttainmentLevel[];
  /** Configurable scoring rule (e.g. "weighted-average", "highest-level"). */
  scoringRule?: string;
}

/** A learner's submission for an assessment activity. */
export interface AssessmentSubmission {
  id: string;
  activityId: string;
  /** Learner id or key. */
  learnerRef: string;
  status: AssessmentStatus;
  submittedAt?: Date | string;
  score?: number;
  /** Matches an AttainmentLevel.key. */
  levelKey?: string;
  feedback?: AssessmentFeedback[];
  /** References to evidence item ids. */
  evidenceRefs?: string[];
}

/** A single observation entry for a learner. */
export interface ObservationEntry {
  id: string;
  learnerRef: string;
  activityRef: string;
  observedAt: Date | string;
  notes?: string;
  /** Matches an AttainmentLevel.key. */
  levelKey?: string;
  evidenceStatus: EvidenceStatus;
}

/** Feedback attached to a submission. */
export interface AssessmentFeedback {
  id: string;
  submissionRef: string;
  author?: string;
  content: string;
  createdAt?: Date | string;
  type?: "formative" | "summative" | "peer" | "self";
}

/** A moderation finding on a submission. */
export interface ModerationFinding {
  id: string;
  submissionRef: string;
  reviewer?: string;
  finding: string;
  correctionStatus: "pending" | "corrected" | "upheld";
  createdAt?: Date | string;
  resolvedAt?: Date | string;
}

/** A piece of evidence (file, photo, recording, etc.). */
export interface EvidenceItem {
  id: string;
  name: string;
  /** MIME type or category string. */
  type?: string;
  size?: number;
  url?: string;
  uploadedAt?: Date | string;
  uploadedBy?: string;
  caption?: string;
  learningAreaRef?: LearningAreaRef;
}

/** A phase/stage within a project-based assessment. */
export interface ProjectPhase {
  id: string;
  label: string;
  description?: string;
  /** References to evidence item ids collected for this phase. */
  evidenceRefs?: string[];
  /** Lifecycle status of this phase. */
  status: AssessmentStatus;
}

/** A performance task assessment definition. */
export interface PerformanceTask {
  id: string;
  title: string;
  description: string;
  successCriteria: string[];
  evidenceRequirements?: string;
  competencyRefs?: string[];
  timeLimit?: string;
  rubricRef?: string;
}

/** A single competency result in a progress report. */
export interface CompetencyResult {
  /** Stable competency or strand key. */
  key: string;
  /** Human-readable label. */
  label: string;
  /** Attainment level achieved (matches an AttainmentLevel.key). */
  levelKey?: string;
  /** Evidence status for this competency. */
  evidenceStatus: EvidenceStatus;
  /** Pre-computed trend direction. */
  trend?: "up" | "down" | "flat";
  /** Optional numeric value (e.g. percentage). */
  value?: number | null;
  /** Optional unit suffix. */
  unit?: string;
}

/** A configurable reflection prompt for learner self-assessment. */
export interface ReflectionPrompt {
  id: string;
  question: string;
  type: "text" | "rating" | "choice";
  /** For "choice" prompts: available options. */
  choices?: string[];
  required?: boolean;
}

/** An approved progress report for a specific audience. */
export interface ProgressReport {
  id: string;
  learnerRef: string;
  /** Reporting period label (e.g. "Term 1, 2025"). */
  period: string;
  summary: string;
  competencyResults: CompetencyResult[];
  attendanceSummary?: string;
  teacherComment?: string;
  nextSteps?: string[];
  generatedAt: Date | string;
  approvedBy?: string;
  audience: "parent" | "teacher" | "leadership" | "learner";
}
