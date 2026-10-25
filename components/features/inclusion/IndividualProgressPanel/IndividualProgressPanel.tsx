import { Info } from "lucide-react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { KpiCard } from "@/components/shared/KpiCard";
import type { KpiCardTrend } from "@/components/shared/KpiCard";
import { TargetProgressCard } from "@/components/shared/TargetProgressCard";
import type { TargetStatus } from "@/lib/analytics";
import type { IndividualProgressMeasure } from "@/components/features/inclusion/types";
import styles from "./IndividualProgressPanel.module.scss";

export interface IndividualProgressPanelProps {
  measures: IndividualProgressMeasure[];
  loading?: boolean;
  error?: string;
  empty?: boolean;
  /** Optional title for the panel. */
  title?: string;
  className?: string;
}

export function IndividualProgressPanel({
  measures,
  loading = false,
  error,
  empty = false,
  title = "Individual progress",
  className,
}: IndividualProgressPanelProps) {
  if (loading) {
    return (
      <Card className={clsx(styles.card, styles.loadingCard, className)} padded>
        <div className={styles.loadingBody}>
          <Spinner size="md" label="Loading progress measures" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <Alert
          variant="error"
          title="Unable to load progress measures"
          description={error}
        />
      </Card>
    );
  }

  const isEmpty = empty || measures.length === 0;

  if (isEmpty) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <EmptyState
          icon={<Info aria-hidden="true" />}
          title="No progress measures"
          description="There are no progress measures to display yet."
        />
      </Card>
    );
  }

  return (
    <Card className={clsx(styles.card, className)} padded>
      <Card.Header className={styles.header}>
        <h4 className={styles.title}>{title}</h4>
      </Card.Header>
      <Card.Body className={styles.body}>
        <div className={styles.grid}>
          {measures.map((measure) => {
            const hasTarget =
              measure.target != null &&
              !Number.isNaN(measure.target) &&
              measure.target !== 0;

            if (hasTarget && measure.progress != null) {
              return (
                <TargetProgressCard
                  key={measure.id}
                  label={measure.label}
                  value={measure.value ?? null}
                  target={measure.target ?? null}
                  progress={measure.progress}
                  status={
                    (measure.progress >= 100
                      ? "exceeded"
                      : measure.progress >= 75
                        ? "on-track"
                        : measure.progress >= 50
                          ? "at-risk"
                          : "behind") as TargetStatus
                  }
                  unit={measure.unit}
                />
              );
            }

            const trend: KpiCardTrend | undefined = measure.trend
              ? { direction: measure.trend }
              : undefined;

            return (
              <KpiCard
                key={measure.id}
                title={measure.label}
                value={measure.value}
                unit={measure.unit}
                trend={trend}
                empty={measure.value == null}
              />
            );
          })}
        </div>
      </Card.Body>
    </Card>
  );
}
