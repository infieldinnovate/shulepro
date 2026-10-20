import type { ReactNode } from "react";
import { CalendarClock, GitCompare } from "lucide-react";
import clsx from "clsx";
import { Breadcrumbs } from "../../layout/Breadcrumbs";
import type { BreadcrumbItem } from "../../ui/Breadcrumb";
import styles from "./ReportHeader.module.scss";

export interface ReportHeaderProps {
  /** Report title. */
  title: ReactNode;
  /** Short description shown beneath the title. */
  description?: ReactNode;
  /** Human-readable label for the reporting period (e.g. "Term 1, 2025"). */
  reportingPeriodLabel?: ReactNode;
  /** Human-readable label for the comparison context, if any. */
  comparisonContextLabel?: ReactNode;
  /** Optional breadcrumb trail. */
  breadcrumbs?: BreadcrumbItem[];
  /** Optional actions rendered on the right (export, print, etc.). */
  actions?: ReactNode;
  /** Max breadcrumb items before collapsing. */
  maxBreadcrumbItems?: number;
  className?: string;
}

export function ReportHeader({
  title,
  description,
  reportingPeriodLabel,
  comparisonContextLabel,
  breadcrumbs,
  actions,
  maxBreadcrumbItems,
  className,
}: ReportHeaderProps) {
  const hasContext = Boolean(reportingPeriodLabel || comparisonContextLabel);

  return (
    <header className={clsx(styles.header, className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs
          items={breadcrumbs}
          maxItems={maxBreadcrumbItems}
          className={styles.breadcrumbs}
        />
      )}

      <div className={styles.main}>
        <div className={styles.text}>
          <h1 className={styles.title}>{title}</h1>
          {description && (
            <p className={styles.description}>{description}</p>
          )}

          {hasContext && (
            <dl className={styles.context}>
              {reportingPeriodLabel && (
                <div className={styles.contextItem}>
                  <dt className={styles.contextLabel}>
                    <CalendarClock
                      className={styles.contextIcon}
                      aria-hidden="true"
                    />
                    Reporting period
                  </dt>
                  <dd className={styles.contextValue}>
                    {reportingPeriodLabel}
                  </dd>
                </div>
              )}
              {comparisonContextLabel && (
                <div className={styles.contextItem}>
                  <dt className={styles.contextLabel}>
                    <GitCompare
                      className={styles.contextIcon}
                      aria-hidden="true"
                    />
                    Comparison
                  </dt>
                  <dd className={styles.contextValue}>
                    {comparisonContextLabel}
                  </dd>
                </div>
              )}
            </dl>
          )}
        </div>

        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </header>
  );
}
