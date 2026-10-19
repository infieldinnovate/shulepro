import type { ReactNode } from "react";

// ============================================================
// Shared header-region types. Domain-neutral; callers supply
// real data and behaviour. No CBC structures are hard-coded.
// ============================================================

export interface SearchSuggestion {
  id: string;
  label: ReactNode;
  /** Optional secondary text shown alongside the label. */
  description?: ReactNode;
  /** Optional category/group heading for the suggestion. */
  group?: string;
  href?: string;
  icon?: ReactNode;
}

export interface NotificationItem {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  /** ISO timestamp string or epoch ms. */
  timestamp: number | string;
  read?: boolean;
  variant?: "info" | "success" | "warning" | "error";
  href?: string;
}

export interface SchoolOption {
  id: string;
  name: string;
  /** Short code or campus tag, e.g. "NBI-01". */
  code?: string;
}

export interface UserDisplayModel {
  id: string;
  name: string;
  /** Role label shown under the name, e.g. "Headteacher". */
  roleLabel?: string;
  email?: string;
  avatarSrc?: string;
  /** Used when no avatar image is supplied. */
  initials?: string;
}

export interface AcademicPeriodOption {
  value: string;
  label: string;
  disabled?: boolean;
}
