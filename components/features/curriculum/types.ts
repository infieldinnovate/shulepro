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

// ============================================================
// Timetable types
// ============================================================

/** A weekday in the timetable. Configurable — no hardcoded names. */
export interface Weekday {
  key: string;
  label: string;
  shortLabel?: string;
  /** Numeric sort order (0-based). */
  order: number;
}

/** A period definition within a school day. */
export interface TimetablePeriod {
  key: string;
  label: string;
  /** Start time (e.g. "08:00"). Format is caller-defined. */
  startTime?: string;
  /** End time (e.g. "08:40"). Format is caller-defined. */
  endTime?: string;
  /** Optional break indicator (e.g. lunch, recess). */
  isBreak?: boolean;
}

/** A single entry in the timetable grid. */
export interface TimetableEntry {
  id: string;
  dayKey: string;
  periodKey: string;
  /** Learning area / subject label. */
  learningArea: string;
  /** Optional learning area code. */
  learningAreaCode?: string;
  /** Teacher name. */
  teacher?: string;
  /** Room or location. */
  location?: string;
  /** Color token for subject coloring (from lib/chartColors). */
  colorToken?: string;
  /** Free-text notes. */
  notes?: string;
}

/** Configurable timetable structure. No hardcoded school times. */
export interface TimetableConfig {
  periods: TimetablePeriod[];
  weekdays: Weekday[];
  /** Optional label for the time column header. */
  timeColumnLabel?: string;
  /** Optional label for empty cells. */
  freeLabel?: string;
}

// ============================================================
// Academic calendar types
// ============================================================

/** Type of an academic calendar event. Configurable. */
export type AcademicCalendarEventType =
  | "term"
  | "exam"
  | "holiday"
  | "meeting"
  | "deadline"
  | "other";

/** A single event on the academic calendar. */
export interface AcademicCalendarEvent {
  id: string;
  title: string;
  /** Single date or range start. */
  date: Date;
  /** Optional end date for multi-day events. */
  endDate?: Date;
  type: AcademicCalendarEventType;
  description?: string;
  /** Color token for event indicator (from lib/chartColors). */
  colorToken?: string;
  /** Optional location. */
  location?: string;
}

// ============================================================
// Assignment types
// ============================================================

/** Status of an assignment. Configurable — no hardcoded curriculum content. */
export type AssignmentStatus =
  | "not-started"
  | "in-progress"
  | "submitted"
  | "graded"
  | "overdue"
  | "draft";

/** An attachment for an assignment. Reuses the AttachmentList shape. */
export interface AssignmentAttachment {
  id: string;
  name: string;
  size: number;
  type?: string;
  url?: string;
  uploadedAt?: number | string;
  uploadedBy?: ReactNode;
}

/** A single assignment. */
export interface Assignment {
  id: string;
  title: string;
  /** Learning area / subject label. */
  learningArea: string;
  /** Optional learning area code. */
  learningAreaCode?: string;
  /** Due date. */
  dueDate: Date;
  status: AssignmentStatus;
  /** Optional description or instructions. */
  description?: string;
  /** Optional completion progress (0-100). */
  progress?: number | null;
  /** Optional attachments. */
  attachments?: AssignmentAttachment[];
  /** Optional assigned teacher name. */
  teacher?: string;
  /** Optional class or group label. */
  classLabel?: string;
}

// ============================================================
// Learning resource types
// ============================================================

/** Type of a learning resource. Configurable. */
export type ResourceType =
  | "textbook"
  | "digital"
  | "worksheet"
  | "video"
  | "audio"
  | "interactive"
  | "document"
  | "link"
  | "other";

/** A learning resource (textbook, digital resource, worksheet, etc.). */
export interface LearningResource {
  id: string;
  title: string;
  type: ResourceType;
  description?: string;
  /** Provider, publisher, or author. */
  provider?: string;
  /** Optional URL for digital resources. */
  url?: string;
  /** Optional thumbnail image URL. */
  thumbnail?: string;
  /** Optional duration (e.g. "12 min", "3:45"). Format is caller-defined. */
  duration?: string;
  /** Optional language label. */
  language?: string;
  /** Optional learning area references (ids or labels). */
  learningAreaRefs?: string[];
  /** Optional grade/class level label. */
  gradeLevel?: string;
}

// ============================================================
// Progress summary types
// ============================================================

/** Trend info for a progress measure, using already-formatted labels. */
export interface ProgressMeasureTrend {
  direction: "up" | "down" | "flat" | null;
  /** Pre-formatted percentage label (e.g. "+12.5%"). */
  percentLabel?: string | null;
  /** Pre-formatted delta label (e.g. "+8"). */
  deltaLabel?: string | null;
  /** Invert polarity so "up" reads as negative. */
  invertPolarity?: boolean;
}

/** Status of a progress measure relative to a target. */
export type ProgressMeasureStatus =
  | "on-track"
  | "at-risk"
  | "behind"
  | "exceeded"
  | "no-target"
  | "neutral";

/** An already-computed progress measure for display. */
export interface ProgressMeasure {
  id: string;
  label: string;
  /** Primary value (numeric or pre-formatted string). */
  value: number | string | null;
  /** Optional unit suffix (e.g. "%", "learners"). */
  unit?: string;
  /** Optional target value. */
  target?: number | string | null;
  /** Optional pre-computed trend. */
  trend?: ProgressMeasureTrend;
  /** Optional status relative to target. */
  status?: ProgressMeasureStatus;
  /** Optional description of what the measure represents. */
  description?: string;
}
