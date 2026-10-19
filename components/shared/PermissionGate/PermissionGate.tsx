import type { ReactNode } from "react";

export interface PermissionGateProps {
  /** A single permission or a set of permissions the user must hold. */
  required: string | string[];
  /** The user's effective UI permissions. */
  permissions: string[] | ReadonlyArray<string>;
  children: ReactNode;
  /**
   * Rendered when access is denied. Ignored when `mode="hidden"`.
   * Defaults to null.
   */
  fallback?: ReactNode;
  /**
   * - "hidden" (default): render nothing when denied.
   * - "fallback": render `fallback` when denied.
   */
  mode?: "hidden" | "fallback";
  className?: string;
}

// PermissionGate is a PRESENTATION-LEVEL utility only. It controls
// visibility in the UI and is NOT an authorization mechanism. Any
// protected data or mutation must be independently enforced on the
// server, never relying on this gate for security.

function hasPermission(
  required: string | string[],
  permissions: ReadonlyArray<string>,
): boolean {
  if (Array.isArray(required)) {
    if (required.length === 0) return true;
    return required.some((p) => permissions.includes(p));
  }
  return permissions.includes(required);
}

export function PermissionGate({
  required,
  permissions,
  children,
  fallback = null,
  mode = "hidden",
  className,
}: PermissionGateProps) {
  const allowed = hasPermission(required, permissions);

  if (allowed) {
    return <>{children}</>;
  }

  if (mode === "fallback") {
    return <div className={className}>{fallback}</div>;
  }

  return null;
}
