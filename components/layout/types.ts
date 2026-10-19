import type { ReactNode } from "react";

// ============================================================
// Shared navigation types for the application shell.
// Domain-neutral: no CBC-specific modules are hard-coded here.
// Consumers supply their own navigation configuration.
// ============================================================

export interface NavBadge {
  content: ReactNode;
  variant?:
    | "neutral"
    | "primary"
    | "success"
    | "warning"
    | "error"
    | "info";
}

export interface SidebarNavItemData {
  id: string;
  label: ReactNode;
  href: string;
  icon?: ReactNode;
  badge?: NavBadge;
  active?: boolean;
  disabled?: boolean;
}

export interface SidebarNavGroupData {
  id: string;
  label: ReactNode;
  items: SidebarNavItemData[];
  defaultOpen?: boolean;
}

export interface SidebarNavSection {
  id: string;
  label?: ReactNode;
  groups?: SidebarNavGroupData[];
  items?: SidebarNavItemData[];
}
