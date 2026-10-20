"use client";

import type { ReactNode } from "react";
import { RotateCcw, ListFilter as FilterIcon } from "lucide-react";
import clsx from "clsx";
import { Card } from "../../ui/Card";
import { Button } from "../../ui/Button";
import styles from "./ReportFilterPanel.module.scss";

export interface ReportFilterPanelProps {
  /** Slot for the filter controls (Selects, pickers, etc.). */
  children?: ReactNode;
  /** Optional heading shown in the panel header. */
  title?: ReactNode;
  /** Optional description shown under the title. */
  description?: ReactNode;
  /** Called when the Apply button is pressed. */
  onApply?: () => void;
  /** Called when the Reset button is pressed. */
  onReset?: () => void;
  /** Label for the apply button. */
  applyLabel?: string;
  /** Label for the reset button. */
  resetLabel?: string;
  /** Show the apply button. Defaults to true when onApply is provided. */
  showApply?: boolean;
  /** Show the reset button. Defaults to true when onReset is provided. */
  showReset?: boolean;
  /** Disable both action buttons. */
  disabled?: boolean;
  /** Show a loading state on the apply button. */
  applying?: boolean;
  /** Accessible label for the filter region. */
  ariaLabel?: string;
  /** Optional extra actions rendered on the header row (e.g. export). */
  headerActions?: ReactNode;
  className?: string;
}

export function ReportFilterPanel({
  children,
  title,
  description,
  onApply,
  onReset,
  applyLabel = "Apply filters",
  resetLabel = "Reset",
  showApply,
  showReset,
  disabled = false,
  applying = false,
  ariaLabel = "Report filters",
  headerActions,
  className,
}: ReportFilterPanelProps) {
  const renderApply = showApply ?? Boolean(onApply);
  const renderReset = showReset ?? Boolean(onReset);
  const hasActions = renderApply || renderReset;

  return (
    <Card
      className={clsx(styles.panel, className)}
      padded={false}
      aria-label={ariaLabel}
    >
      {(title || description || headerActions) && (
        <Card.Header className={styles.header}>
          <div className={styles.headerText}>
            {title && (
              <div className={styles.titleRow}>
                <FilterIcon
                  className={styles.titleIcon}
                  aria-hidden="true"
                />
                <h3 className={styles.title}>{title}</h3>
              </div>
            )}
            {description && (
              <p className={styles.description}>{description}</p>
            )}
          </div>
          {headerActions && (
            <div className={styles.headerActions}>{headerActions}</div>
          )}
        </Card.Header>
      )}

      <Card.Body className={styles.body}>{children}</Card.Body>

      {hasActions && (
        <Card.Footer className={styles.footer}>
          <div className={styles.actions}>
            {renderReset && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                leftIcon={<RotateCcw aria-hidden="true" />}
                onClick={onReset}
                disabled={disabled || applying}
              >
                {resetLabel}
              </Button>
            )}
            {renderApply && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                loading={applying}
                onClick={onApply}
                disabled={disabled}
              >
                {applyLabel}
              </Button>
            )}
          </div>
        </Card.Footer>
      )}
    </Card>
  );
}
