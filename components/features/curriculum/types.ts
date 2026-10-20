import type { ReactNode } from "react";

/** A grade/year level in the school. Configurable — no hardcoded values. */
export interface Grade {
  id: string;
  label: string;
  /** Numeric ordering for sorting (e.g. 1, 2, 3). */
  level?: number;
  /** Optional description or curriculum stage label. */
  description?: string;
  disabled?: boolean;
}

/** A teacher assigned to a class. */
export interface ClassTeacher {
  id: string;
  name: string;
  avatarSrc?: string;
  initials?: string;
  roleLabel?: string;
}

/** A class within a grade. */
export interface Class {
  id: string;
  label: string;
  gradeId?: string;
  /** Teacher(s) assigned to this class. */
  teachers?: ClassTeacher[];
  /** Number of enrolled learners, if pre-computed. */
  size?: number;
  /** Optional room or location label. */
  room?: string;
  disabled?: boolean;
}

/** A learning area / subject. Configurable — no hardcoded official names. */
export interface LearningArea {
  id: string;
  label: string;
  /** Optional code or abbreviation. */
  code?: string;
  /** Optional grouping (e.g. "Sciences", "Languages"). */
  group?: string;
  description?: string;
  disabled?: boolean;
}

/** Enrolment status badge info for a roster entry. */
export interface ClassRosterEntryStatus {
  status: string;
  variant?: "neutral" | "primary" | "success" | "warning" | "error" | "info";
  label?: string;
}

/** A single learner row in a class roster. */
export interface ClassRosterEntry {
  id: string;
  name: string;
  /** Display identifier (e.g. admission number). */
  identifier?: string;
  /** Alternate identifiers (e.g. UPI, NEMIS). */
  alternateIds?: { label: string; value: string }[];
  avatarSrc?: string;
  initials?: string;
  gender?: string;
  enrolmentStatus?: ClassRosterEntryStatus;
  /** Arbitrary extra meta columns, keyed by column id. */
  meta?: Record<string, ReactNode>;
}

/** A summary stat for a class (e.g. class size, attendance rate). */
export interface ClassSummaryStat {
  id: string;
  label: string;
  value: string | number | null;
  unit?: string;
  icon?: ReactNode;
}

/** Type of a curriculum node in a nested tree. */
export type CurriculumNodeType =
  | "subject"
  | "strand"
  | "sub-strand"
  | "outcome"
  | "topic"
  | "other";

/** Generic nested curriculum node (strands, sub-strands, outcomes). */
export interface CurriculumNode {
  id: string;
  label: string;
  type: CurriculumNodeType;
  /** Optional code or reference number. */
  code?: string;
  description?: string;
  /** Child nodes (sub-strands, outcomes, etc.). */
  children?: CurriculumNode[];
  /** Arbitrary metadata for the node. */
  meta?: Record<string, ReactNode>;
}

/** Coverage state for a single cell in a coverage matrix. */
export type CurriculumCoverageState =
  | "planned"
  | "taught"
  | "assessed"
  | "insufficient-evidence"
  | "not-started";

/** A single cell in the coverage matrix. */
export interface CurriculumCoverageCell {
  rowKey: string;
  columnKey: string;
  state: CurriculumCoverageState;
  /** Optional numeric value (e.g. percentage assessed). */
  value?: number | null;
  /** Optional display label override. */
  displayLabel?: string;
}

/** A row in the coverage matrix (outcome, strand, or sub-strand). */
export interface CurriculumCoverageRow {
  key: string;
  label: string;
  /** Optional code or reference. */
  code?: string;
  /** Optional parent label for grouping display. */
  group?: string;
}

/** A column in the coverage matrix (class, teacher, or period). */
export interface CurriculumCoverageColumn {
  key: string;
  label: string;
  shortLabel?: string;
  description?: string;
}

/** Legend entry for the coverage matrix. */
export interface CurriculumCoverageLegendEntry {
  state: CurriculumCoverageState;
  label: string;
  description?: string;
}
