import type { ReactNode } from "react";
import clsx from "clsx";
import styles from "./Progress.module.scss";

export type ProgressSize = "sm" | "md" | "lg";

export interface ProgressProps {
  /** Determinate value between `min` and `max`. Omit or set `indeterminate` for an unknown value. */
  value?: number;
  indeterminate?: boolean;
  size?: ProgressSize;
  /** Optional visible label above the bar. */
  label?: ReactNode;
  /** Accessible value text (e.g. "45 percent"). Falls back to `${percent}%`. */
  valueText?: string;
  /** Minimum value (default 0). */
  min?: number;
  /** Maximum value (default 100). */
  max?: number;
  className?: string;
}

export function Progress({
  value,
  indeterminate = false,
  size = "md",
  label,
  valueText,
  min = 0,
  max = 100,
  className,
}: ProgressProps) {
  const isIndeterminate = indeterminate || value == null || Number.isNaN(value);
  const clamped = isIndeterminate
    ? min
    : Math.min(Math.max(value as number, min), max);
  const range = Math.max(max - min, 1);
  const percent = Math.round(((clamped - min) / range) * 100);
  const accessibleValueText = valueText ?? `${percent}%`;

  return (
    <div className={clsx(styles.container, styles[size], className)}>
      {label && <span className={styles.label}>{label}</span>}
      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={isIndeterminate ? undefined : clamped}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={isIndeterminate ? undefined : accessibleValueText}
        aria-busy={isIndeterminate ? true : undefined}
        aria-label={typeof label === "string" ? label : undefined}
      >
        <div
          className={clsx(styles.bar, isIndeterminate && styles.indeterminate)}
          style={isIndeterminate ? undefined : { inlineSize: `${percent}%` }}
        />
      </div>
    </div>
  );
}