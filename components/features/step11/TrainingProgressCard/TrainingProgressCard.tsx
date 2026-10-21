import type { ReactNode } from "react";
import clsx from "clsx";
import { Card } from "../../../ui/Card";
import { Progress } from "../../../ui/Progress";
import { Spinner } from "../../../ui/Spinner";
import { EmptyState } from "../../../ui/EmptyState";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";
import type { LearningModule, CompletionRecord, DisabledState } from "../models";
import styles from "./TrainingProgressCard.module.scss";

/**
 * Aggregated progress data supplied entirely by the caller.
 * The component does NOT compute progress from any backend —
 * it only displays what is provided.
 */
export interface TrainingProgressData {
  /** Optional overall completion percentage (0–100, caller-supplied). */
  overallPercent?: number | null;
  /** Per-module progress entries, caller-supplied. */
  modules: ModuleProgressEntry[];
}

export interface ModuleProgressEntry {
  /** The module this entry refers to. */
  module: LearningModule;
  /** Whether this module has been completed. */
  completed: boolean;
  /** Optional completion record, if one exists. */
  completionRecord?: CompletionRecord | null;
  /** Optional caller-supplied progress percentage (0–100). */
  percent?: number | null;
}

export interface TrainingProgressCardProps {
  /** Supplied progress data — never fetched. */
  progress?: TrainingProgressData | null;
  /** Optional course title for display. */
  courseTitle?: string;
  /** Loading state. */
  loading?: boolean;
  /** Empty state. */
  empty?: boolean;
  /** Disabled state. */
  disabled?: DisabledState;
  /** Optional action slot. */
  actions?: ReactNode;
  className?: string;
}

export function TrainingProgressCard({
  progress,
  courseTitle,
  loading = false,
  empty = false,
  disabled,
  actions,
  className,
}: TrainingProgressCardProps) {
  if (loading) {
    return (
      <Card padded className={clsx(styles.loading, className)}>
        <Spinner size="md" label="Loading progress" />
      </Card>
    );
  }

  if (empty || !progress || progress.modules.length === 0) {
    return (
      <Card padded className={clsx(styles.empty, className)}>
        <EmptyState
          icon={<Circle aria-hidden="true" />}
          title="No progress data"
          description="No training progress to display."
        />
      </Card>
    );
  }

  const isDisabled = Boolean(disabled?.disabled);
  const completedCount = progress.modules.filter((m) => m.completed).length;
  const overallPercent = progress.overallPercent ?? null;

  return (
    <Card
      padded={false}
      className={clsx(styles.card, isDisabled && styles.disabled, className)}
      aria-disabled={isDisabled || undefined}
    >
      <div className={styles.body}>
        {courseTitle && <h3 className={styles.title}>{courseTitle}</h3>}

        {(overallPercent != null || courseTitle) && (
          <div className={styles.overall}>
            {overallPercent != null && (
              <Progress
                value={overallPercent}
                label="Overall progress"
                size="md"
                className={styles.overallBar}
              />
            )}
            <p className={styles.summary}>
              {completedCount} of {progress.modules.length} modules complete
            </p>
          </div>
        )}

        <ul className={styles.moduleList}>
          {progress.modules.map((entry) => (
            <li key={entry.module.id} className={styles.moduleItem}>
              <span className={styles.moduleIcon}>
                {entry.completed ? (
                  <CheckCircle2 aria-hidden="true" />
                ) : entry.completionRecord?.passed === false ? (
                  <AlertCircle aria-hidden="true" />
                ) : (
                  <Circle aria-hidden="true" />
                )}
              </span>
              <div className={styles.moduleInfo}>
                <p className={styles.moduleTitle}>{entry.module.title}</p>
                {entry.module.durationLabel && (
                  <p className={styles.moduleDuration}>
                    {entry.module.durationLabel}
                  </p>
                )}
                {entry.completionRecord?.scoreLabel && (
                  <p className={styles.moduleScore}>
                    Score: {entry.completionRecord.scoreLabel}
                  </p>
                )}
              </div>
              {entry.percent != null && (
                <span className={styles.modulePercent}>{entry.percent}%</span>
              )}
            </li>
          ))}
        </ul>

        {isDisabled && disabled?.disabledReason && (
          <p className={styles.disabledReason}>{disabled.disabledReason}</p>
        )}
      </div>

      {actions && (
        <div className={styles.footer}>
          <div className={styles.actions}>{actions}</div>
        </div>
      )}
    </Card>
  );
}
