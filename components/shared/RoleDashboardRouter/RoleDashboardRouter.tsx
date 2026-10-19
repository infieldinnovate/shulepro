import type { ReactNode } from "react";

export type RoleKey = string;

export interface RoleDashboardRouterProps {
  currentRole: RoleKey;
  /**
   * Map of role key -> view content. Values may be a ReactNode or a
   * render function invoked with the current role. The caller owns the
   * actual dashboard content; RoleDashboardRouter only dispatches.
   */
  views: Record<RoleKey, ReactNode | ((role: RoleKey) => ReactNode)>;
  /** Rendered when `currentRole` has no matching entry in `views`. */
  fallback?: ReactNode;
  className?: string;
}

export function RoleDashboardRouter({
  currentRole,
  views,
  fallback = null,
  className,
}: RoleDashboardRouterProps) {
  const entry = views[currentRole];

  if (entry == null) {
    return <>{fallback}</>;
  }

  const rendered =
    typeof entry === "function" ? (entry as (role: RoleKey) => ReactNode)(currentRole) : entry;

  return <div className={className}>{rendered}</div>;
}
