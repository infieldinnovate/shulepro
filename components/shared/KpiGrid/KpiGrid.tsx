import type { ReactNode } from "react";
import clsx from "clsx";
import styles from "./KpiGrid.module.scss";

export interface KpiGridProps {
  children: ReactNode;
  className?: string;
  /** Override the number of columns at each breakpoint. Defaults to 1/2/2/4/4. */
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  /** Accessible label for the grid region. */
  label?: string;
}

export function KpiGrid({
  children,
  className,
  columns,
  label,
}: KpiGridProps) {
  const sm = columns?.sm ?? 2;
  const md = columns?.md ?? 2;
  const lg = columns?.lg ?? 4;
  const xl = columns?.xl ?? 4;

  return (
    <div
      className={clsx(styles.grid, className)}
      style={{
        "--kpi-grid-sm": sm,
        "--kpi-grid-md": md,
        "--kpi-grid-lg": lg,
        "--kpi-grid-xl": xl,
      } as React.CSSProperties}
      role={label ? "region" : undefined}
      aria-label={label}
    >
      {children}
    </div>
  );
}
