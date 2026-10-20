import type { ReactNode } from "react";
import { TrendingUp } from "lucide-react";
import clsx from "clsx";
import { Spinner } from "../../../ui/Spinner";
import { Alert } from "../../../ui/Alert";
import { EmptyState } from "../../../ui/EmptyState";
import { KpiCard } from "../../../shared/KpiCard";
import { KpiGrid } from "../../../shared/KpiGrid";
import { TargetProgressCard } from "../../../shared/TargetProgressCard";
import type { KpiCardStatus } from "../../../shared/KpiCard";
import type { ProgressMeasure, ProgressMeasureStatus } from "../types";
import type { TargetStatus } from "@/lib/analytics";
import styles from "./ProgressSummary.module.scss";

export interface ProgressSummaryProps {
  measures: ProgressMeasure[];
  loading?: boolean;
  error?: string;
  empty?: boolean;
  /** Optional summary heading text. */
  summary?: string;
  /** Disable interactions. */
  disabled?: boolean;
  className?: string;
  /** Accessible label for the summary region. */
  ariaLabel?: string;
  /** Optional slot for additional content below the grid. */
  children?: ReactNode;
}

const STATUS_TO_KPI: Record<ProgressMeasureStatus, KpiCardStatus> = {
  "on-track": "good",
  "at-risk": "warning",
  behind: "critical",
  exceeded: "good",
  "no-target": "neutral",
  neutral: "neutral",
};

const STATUS_TO_TARGET: Record<ProgressMeasureStatus, TargetStatus> = {
  "on-track": "on-track",
  "at-risk": "at-risk",
  behind: "behind",
  exceeded: "exceeded",
  "no-target": "no-target",
  neutral: "no-target",
};

function isNumeric(value: unknown): value is number {
  return typeof value === "number" && !Number.isNaN(value);
}

export function ProgressSummary({
  measures,
  loading = false,
  error,
  empty = false,
  summary,
  disabled = false,
  className,
  ariaLabel = "Progress summary",
  children,
}: ProgressSummaryProps) {
  if (loading) {
    return (
      <section className={clsx(styles.section, className)} aria-label={ariaLabel}>
        <div className={styles.loading}>
          <Spinner size="md" label="Loading progress" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={clsx(styles.section, className)} aria-label={ariaLabel}>
        <Alert
          variant="error"
          title="Unable to load progress"
          description={error}
        />
      </section>
    );
  }

  if (empty || measures.length === 0) {
    return (
      <section className={clsx(styles.section, className)} aria-label={ariaLabel}>
        <EmptyState
          icon={<TrendingUp aria-hidden="true" />}
          title="No progress data"
          description="There is no progress data to display."
        />
      </section>
    );
  }

  const cards = measures.map((measure) => {
    const hasTarget = measure.target != null;
    const numericValue = isNumeric(measure.value) ? measure.value : null;

    // When a target exists and the value is numeric, use TargetProgressCard
    if (hasTarget && numericValue != null) {
      const targetNum = isNumeric(measure.target) ? measure.target : null;
      if (targetNum != null) {
        const ratio = targetNum !== 0 ? numericValue / targetNum : 0;
        const progress = Math.min(Math.max(ratio * 100, 0), 100);
        const status = measure.status
          ? STATUS_TO_TARGET[measure.status]
          : "no-target";

        return (
          <TargetProgressCard
            key={measure.id}
            label={measure.label}
            value={numericValue}
            target={targetNum}
            progress={progress}
            status={status}
            unit={measure.unit}
            description={measure.description}
            className={styles.measureCard}
          />
        );
      }
    }

    // Otherwise use KpiCard
    const kpiStatus = measure.status ? STATUS_TO_KPI[measure.status] : "neutral";
    const targetProp =
      measure.target != null
        ? { label: "Target", value: measure.target }
        : undefined;

    return (
      <KpiCard
        key={measure.id}
        title={measure.label}
        value={measure.value}
        unit={measure.unit}
        status={kpiStatus}
        target={targetProp}
        description={measure.description}
        trend={
          measure.trend
            ? {
                direction: measure.trend.direction,
                percentLabel: measure.trend.percentLabel,
                deltaLabel: measure.trend.deltaLabel,
                invertPolarity: measure.trend.invertPolarity,
              }
            : undefined
        }
        className={styles.measureCard}
      />
    );
  });

  return (
    <section className={clsx(styles.section, className)} aria-label={ariaLabel}>
      {summary && <p className={styles.summary}>{summary}</p>}
      <KpiGrid
        label={ariaLabel}
        columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
        className={clsx(disabled && styles.disabled)}
      >
        {cards}
      </KpiGrid>
      {children}
    </section>
  );
}
