import type { ReactNode } from "react";
import { Info } from "lucide-react";
import clsx from "clsx";
import { Card } from "../../ui/Card";
import { Progress } from "../../ui/Progress";
import { Spinner } from "../../ui/Spinner";
import { EmptyState } from "../../ui/EmptyState";
import { Alert } from "../../ui/Alert";
import type { TargetStatus } from "@/lib/analytics";
import styles from "./TargetProgressCard.module.scss";

export interface TargetProgressCardProps {
  label: string;
  /** Current value. */
  value: number | null | undefined;
  /** Target value. Pass null when no target is set. */
  target: number | null | undefined;
  /** Computed progress (0-100) from computeTargetProgress(). */
  progress: number | null;
  /** Computed status from computeTargetProgress(). */
  status: TargetStatus;
  /** Unit suffix (e.g. "%", "learners"). */
  unit?: string;
  /** Format the numeric values for display (defaults to raw number). */
  formatValue?: (n: number) => string;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  description?: string;
  /** Optional definition tooltip node (typically a MetricDefinitionTooltip). */
  definition?: ReactNode;
  className?: string;
  children?: ReactNode;
}

const STATUS_LABEL: Record<TargetStatus, string> = {
  "on-track": "On track",
  "at-risk": "At risk",
  behind: "Behind",
  exceeded: "Exceeded",
  "no-target": "No target set",
};

const STATUS_TONE: Record<TargetStatus, string> = {
  "on-track": "onTrack",
  "at-risk": "atRisk",
  behind: "behind",
  exceeded: "exceeded",
  "no-target": "noTarget",
};

export function TargetProgressCard({
  label,
  value,
  target,
  progress,
  status,
  unit,
  formatValue,
  loading = false,
  error,
  empty = false,
  description,
  definition,
  className,
  children,
}: TargetProgressCardProps) {
  const fmt = formatValue ?? ((n: number) => String(n));
  const hasTarget = status !== "no-target";

  const body = (() => {
    if (loading) {
      return (
        <div className={styles.loadingBody}>
          <Spinner size="md" label={`Loading ${label}`} />
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="error" title="Data unavailable" description={error} />
      );
    }

    if (empty || value == null) {
      return (
        <EmptyState
          icon={<Info aria-hidden="true" />}
          title="No data yet"
          description={`There is no data available for ${label.toLowerCase()} yet.`}
        />
      );
    }

    return (
      <div className={styles.content}>
        <div className={styles.figureRow}>
          <span className={styles.figure}>
            {fmt(value)}
            {unit && <span className={styles.unit}> {unit}</span>}
          </span>
          {hasTarget && target != null && (
            <span className={styles.targetFigure}>
              of {fmt(target)}
              {unit && ` ${unit}`}
            </span>
          )}
        </div>
        {hasTarget ? (
          <Progress
            value={progress ?? 0}
            min={0}
            max={100}
            label={`${label} target progress`}
            valueText={`${Math.round(progress ?? 0)} percent of target`}
            className={clsx(styles.progress, styles[STATUS_TONE[status]])}
          />
        ) : (
          <p className={styles.noTarget}>No target has been set.</p>
        )}
      </div>
    );
  })();

  return (
    <Card className={clsx(styles.card, className)} padded>
      <Card.Header className={styles.header}>
        <div className={styles.titleRow}>
          <h4 className={styles.title} title={description}>
            {label}
          </h4>
          {definition && (
            <span className={styles.definition}>{definition}</span>
          )}
        </div>
        <span
          className={clsx(styles.statusBadge, styles[STATUS_TONE[status]])}
          aria-label={`Status: ${STATUS_LABEL[status]}`}
        >
          {STATUS_LABEL[status]}
        </span>
      </Card.Header>
      <Card.Body className={styles.body}>
        {body}
        {children}
      </Card.Body>
    </Card>
  );
}
