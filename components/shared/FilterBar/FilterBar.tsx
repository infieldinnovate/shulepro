import type { ReactNode } from "react";
import clsx from "clsx";
import styles from "./FilterBar.module.scss";

export interface FilterBarProps {
  /** Controlled search input (typically a SearchInput). */
  search?: ReactNode;
  /** Slot for filter controls (Selects, DatePickers, etc.). */
  filters?: ReactNode;
  /** Called when the reset button is pressed. */
  onReset?: () => void;
  /** Label for the reset button. */
  resetLabel?: string;
  /** Optional node describing the current result count. */
  resultCount?: ReactNode;
  /** Accessible label for the toolbar region. */
  ariaLabel?: string;
  className?: string;
}

export function FilterBar({
  search,
  filters,
  onReset,
  resetLabel = "Reset filters",
  resultCount,
  ariaLabel = "Filters",
  className,
}: FilterBarProps) {
  const hasControls = Boolean(search || filters);
  const hasMeta = Boolean(resultCount || onReset);

  return (
    <div
      className={clsx(styles.bar, className)}
      role="toolbar"
      aria-label={ariaLabel}
    >
      {hasControls && (
        <div className={styles.row}>
          {search && <div className={styles.search}>{search}</div>}
          {filters && <div className={styles.filters}>{filters}</div>}
        </div>
      )}
      {hasMeta && (
        <div className={styles.meta}>
          {resultCount != null && (
            <span className={styles.resultCount}>{resultCount}</span>
          )}
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className={styles.resetButton}
            >
              {resetLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
