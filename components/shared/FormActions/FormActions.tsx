import type { ReactNode } from "react";
import clsx from "clsx";
import styles from "./FormActions.module.scss";

export interface FormActionsProps {
  /** Primary submit action (typically a submit Button). */
  submit?: ReactNode;
  /** Cancel/back action. */
  cancel?: ReactNode;
  /** Reset action. */
  reset?: ReactNode;
  /** Secondary actions rendered on the inline-start side. */
  secondary?: ReactNode;
  /** Leading slot rendered before secondary actions. */
  start?: ReactNode;
  /** Trailing slot rendered after the submit action. */
  end?: ReactNode;
  /** Mobile alignment. Defaults to stretch for touch targets. */
  align?: "start" | "end";
  /** Stretch buttons to full width on narrow screens (default true). */
  stretchMobile?: boolean;
  className?: string;
}

export function FormActions({
  submit,
  cancel,
  reset,
  secondary,
  start,
  end,
  align = "end",
  stretchMobile = true,
  className,
}: FormActionsProps) {
  const hasLeft = Boolean(start || secondary || reset);
  const hasRight = Boolean(submit || cancel || end);

  if (!hasLeft && !hasRight) return null;

  return (
    <div
      className={clsx(
        styles.actions,
        align === "start" ? styles.alignStart : styles.alignEnd,
        stretchMobile && styles.stretchMobile,
        className,
      )}
      role="group"
      aria-label="Form actions"
    >
      {hasLeft && (
        <div className={styles.left}>
          {start}
          {secondary}
          {reset}
        </div>
      )}
      {hasRight && (
        <div className={styles.right}>
          {cancel}
          {submit}
          {end}
        </div>
      )}
    </div>
  );
}
