import type { ReactNode } from "react";
import { BookOpen, CalendarClock, Target } from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { AssessmentStatusBadge } from "@/components/features/assessment/AssessmentStatusBadge";
import type { AssessmentActivity } from "@/components/features/assessment/types";
import styles from "./AssessmentActivityCard.module.scss";

export interface AssessmentActivityCardProps {
  activity: AssessmentActivity;
  /** Optional label for the learning area, looked up from the ref. */
  learningAreaLabel?: string;
  /** Optional lookup from competency key to display label. */
  competencyLabels?: Record<string, string>;
  /** Optional completion progress (0-100). */
  progress?: number | null;
  onSelect?: (activity: AssessmentActivity) => void;
  onEdit?: (activity: AssessmentActivity) => void;
  /** Optional action slot rendered in the footer. */
  actions?: ReactNode;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  className?: string;
}

function formatDueDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isToday(d)) return `Today, ${format(d, "h:mm a")}`;
  return format(d, "EEE, MMM d, yyyy");
}

function isOverdue(activity: AssessmentActivity): boolean {
  if (!activity.dueDate) return false;
  const terminal: string[] = ["submitted", "moderated", "published"];
  if (terminal.includes(activity.status)) return false;
  const d = typeof activity.dueDate === "string" ? new Date(activity.dueDate) : activity.dueDate;
  return isPast(d) && !isToday(d);
}

export function AssessmentActivityCard({
  activity,
  learningAreaLabel,
  competencyLabels,
  progress,
  onSelect,
  onEdit,
  actions,
  loading = false,
  error,
  empty = false,
  className,
}: AssessmentActivityCardProps) {
  if (loading) {
    return (
      <Card className={clsx(styles.card, styles.loadingCard, className)} padded>
        <div className={styles.loadingBody}>
          <Spinner size="md" label="Loading assessment activity" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <Alert
          variant="error"
          title="Unable to load assessment activity"
          description={error}
        />
      </Card>
    );
  }

  if (empty || !activity) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <EmptyState
          icon={<Target aria-hidden="true" />}
          title="No assessment activity"
          description="There is no assessment activity to display."
        />
      </Card>
    );
  }

  const overdue = isOverdue(activity);
  const hasProgress =
    progress != null &&
    !Number.isNaN(progress) &&
    progress >= 0 &&
    progress <= 100;
  const interactive = Boolean(onSelect);
  const areaLabel = learningAreaLabel ?? activity.learningAreaRef;

  return (
    <Card
      className={clsx(
        styles.card,
        interactive && styles.interactive,
        overdue && styles.overdue,
        className,
      )}
      padded
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? () => onSelect?.(activity) : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect?.(activity);
              }
            }
          : undefined
      }
      aria-label={interactive ? `View assessment: ${activity.title}` : undefined}
    >
      <Card.Header className={styles.header}>
        <div className={styles.titleRow}>
          <h4 className={styles.title}>{activity.title}</h4>
          <AssessmentStatusBadge
            status={activity.status}
            size="sm"
          />
        </div>
        <div className={styles.metaRow}>
          <span className={styles.metaItem}>
            <BookOpen aria-hidden="true" className={styles.metaIcon} />
            {areaLabel}
          </span>
          {activity.dueDate && (
            <span
              className={clsx(
                styles.metaItem,
                overdue && styles.metaItemOverdue,
              )}
            >
              <CalendarClock aria-hidden="true" className={styles.metaIcon} />
              Due: {formatDueDate(activity.dueDate)}
            </span>
          )}
        </div>
      </Card.Header>

      <Card.Body className={styles.body}>
        {activity.description && (
          <p className={styles.description}>{activity.description}</p>
        )}

        {activity.competencies.length > 0 && (
          <div className={styles.competencies}>
            {activity.competencies.map((key) => (
              <Badge key={key} variant="neutral" size="sm">
                {competencyLabels?.[key] ?? key}
              </Badge>
            ))}
          </div>
        )}

        {activity.attainmentLevels.length > 0 && (
          <div className={styles.levels}>
            <span className={styles.levelsLabel}>Levels:</span>
            <div className={styles.levelTags}>
              {activity.attainmentLevels
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((level) => (
                  <Badge key={level.key} variant="info" size="sm">
                    {level.shortLabel ?? level.label}
                  </Badge>
                ))}
            </div>
          </div>
        )}

        {hasProgress && (
          <Progress
            value={progress as number}
            label="Completion progress"
            valueText={`${Math.round(progress as number)} percent complete`}
            size="sm"
            className={styles.progress}
          />
        )}
      </Card.Body>

      {(onEdit || actions) && (
        <Card.Footer className={styles.footer}>
          {actions}
          {onEdit && (
            <button
              type="button"
              className={styles.editBtn}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(activity);
              }}
            >
              Edit
            </button>
          )}
        </Card.Footer>
      )}
    </Card>
  );
}
