import type { ReactNode } from "react";
import clsx from "clsx";
import styles from "./Badge.module.scss";

export type BadgeVariant =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "info";

export type BadgeSize = "sm" | "md";

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  /** Render a leading status dot. */
  dot?: boolean;
  /** Render a leading icon (overrides dot when both provided). */
  icon?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export function Badge({
  variant = "neutral",
  size = "md",
  dot = false,
  icon,
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        styles.badge,
        styles[variant],
        styles[size],
        className,
      )}
    >
      {dot && !icon && <span className={styles.dot} aria-hidden="true" />}
      {icon && <span className={styles.icon}>{icon}</span>}
      {children != null && <span className={styles.label}>{children}</span>}
    </span>
  );
}
