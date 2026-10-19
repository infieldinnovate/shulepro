import type { ReactNode } from "react";
import clsx from "clsx";
import styles from "./EmptyState.module.scss";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Primary action slot (e.g. a Button). */
  primaryAction?: ReactNode;
  /** Secondary action slot (e.g. a ghost Button or link). */
  secondaryAction?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={clsx(styles.emptyState, className)}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {(primaryAction || secondaryAction) && (
        <div className={styles.actions}>
          {primaryAction}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
