import type { ReactNode } from "react";
import type { TrendDirection } from "@/lib/analytics";

export type LearnerGender = string;

export interface LearnerIdentifier {
  id: string;
  displayLabel?: string;
  alternateIds?: { label: string; value: string }[];
}

export interface LearnerContact {
  phone?: string;
  email?: string;
  addressLine?: string;
  postalCode?: string;
  town?: string;
}

export type EnrolmentStatus = string;

export interface LearnerEnrolment {
  status: EnrolmentStatus;
  gradeLabel?: string;
  classLabel?: string;
  enrolledOn?: number | string;
  exitedOn?: number | string;
  exitReason?: string;
}

export type GuardianRelationship = string;

export interface Guardian {
  id: string;
  name: string;
  relationship?: GuardianRelationship;
  contact?: LearnerContact;
  avatarSrc?: string;
  primary?: boolean;
}

export interface Learner {
  id: string;
  name: string;
  identifiers?: LearnerIdentifier;
  contact?: LearnerContact;
  gender?: LearnerGender;
  avatarSrc?: string;
  initials?: string;
  enrolment?: LearnerEnrolment;
  guardians?: Guardian[];
  meta?: { label: string; value: string }[];
}

export interface LearnerQuickStat {
  id: string;
  label: string;
  value: number | string | null;
  unit?: string;
  target?: { label: string; value: number | string };
  trend?: {
    direction: TrendDirection | null;
    percentLabel?: string | null;
    deltaLabel?: string | null;
    invertPolarity?: boolean;
  };
  status?: "good" | "warning" | "critical" | "neutral";
  description?: string;
  icon?: ReactNode;
  definition?: ReactNode;
  onSelect?: () => void;
}
