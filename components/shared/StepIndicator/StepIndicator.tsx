import type { ReactNode } from "react";
import { Check, Lock } from "lucide-react";
import clsx from "clsx";
import styles from "./StepIndicator.module.scss";

export type StepStatus = "completed" | "current" | "pending" | "blocked";

export interface StepIndicatorStep {
  id: string;
  label: ReactNode;
  description?: ReactNode;
  status: StepStatus;
}

export interface StepIndicatorProps {
  steps: StepIndicatorStep[];
  /**
   * When provided, steps render as buttons that fire this callback.
   * Used for editable review navigation. Steps with status "blocked"
   * are never clickable.
   */
  onStepClick?: (index: number) => void;
  ariaLabel?: string;
  className?: string;
}

export function StepIndicator({
  steps,
  onStepClick,
  ariaLabel = "Form steps",
  className,
}: StepIndicatorProps) {
  if (steps.length === 0) return null;

  return (
    <ol className={clsx(styles.list, className)} aria-label={ariaLabel}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const interactive = Boolean(onStepClick) && step.status !== "blocked";

        const marker =
          step.status === "completed" ? (
            <Check aria-hidden="true" />
          ) : step.status === "blocked" ? (
            <Lock aria-hidden="true" />
          ) : (
            index + 1
          );

        const connectorClass = clsx(
          styles.connector,
          step.status === "completed" && styles.completed,
          step.status === "blocked" && styles.blocked,
        );

        const content = (
          <div className={styles.row}>
            <span className={styles.marker} aria-hidden="true">
              {marker}
            </span>
            <span className={styles.labelBlock}>
              <span className={styles.label}>{step.label}</span>
              {step.description && (
                <span className={styles.description}>{step.description}</span>
              )}
            </span>
          </div>
        );

        return (
          <li
            key={step.id}
            className={clsx(styles.item, styles[step.status])}
            aria-current={step.status === "current" ? "step" : undefined}
          >
            {interactive ? (
              <button
                type="button"
                className={styles.button}
                onClick={() => onStepClick?.(index)}
              >
                {content}
              </button>
            ) : (
              content
            )}
            {!isLast && <span className={connectorClass} aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}
