"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { isPast, isToday } from "date-fns";
import { CalendarClock, Pencil } from "lucide-react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Progress } from "@/components/ui/Progress";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import type { SupportGoal } from "@/components/features/inclusion/types";
import { formatTodayOrDate } from "@/lib/formatTime";
import styles from "./SupportGoalCard.module.scss";

export interface SupportGoalCardProps {
  goal: SupportGoal | null;
  /** Optional status badge node rendered by the caller. */
  statusBadge?: ReactNode;
  /** When provided, clicking the card calls this handler. */
  onSelect?: (goal: SupportGoal) => void;
  /** When provided, an edit button is rendered. */
  onEdit?: (goal: SupportGoal) => void;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  disabled?: boolean;
  className?: string;
}

function isReviewOverdue(goal: SupportGoal): boolean {
  if (!goal.reviewDate) return false;
  if (goal.status === "achieved" || goal.status === "discontinued") return false;
  const d =
    typeof goal.reviewDate === "string" ? new Date(goal.reviewDate) : goal.reviewDate;
  return isPast(d) && !isToday(d);
}

export function SupportGoalCard({
  goal,
  statusBadge,
  onSelect,
  onEdit,
  loading = false,
  error,
  empty = false,
  disabled = false,
  className,
}: SupportGoalCardProps) {
  if (loading) {
    return (
      <Card className={clsx(styles.card, styles.loadingCard, className)} padded>
        <div className={styles.loadingBody}>
          <Spinner size="md" label="Loading support goal" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <Alert
          variant="error"
          title="Unable to load support goal"
          description={error}
        />
      </Card>
    );
  }

  if (empty || !goal) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <EmptyState
          icon={<Pencil aria-hidden="true" />}
          title="No support goal"
          description="There is no support goal to display yet."
        />
      </Card>
    );
  }

  const clickable = typeof onSelect === "function" && !disabled;
  const overdue = isReviewOverdue(goal);
  const hasProgress =
    goal.progress != null &&
    !Number.isNaN(goal.progress) &&
    goal.progress >= 0 &&
    goal.progress <= 100;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!clickable) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect?.(goal);
    }
  };

  return (
    <Card
      className={clsx(
        styles.card,
        clickable && styles.interactive,
        overdue && styles.overdue,
        disabled && styles.disabled,
        className,
      )}
      padded
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? () => onSelect?.(goal) : undefined}
      onKeyDown={handleKeyDown}
      aria-label={clickable ? `View goal: ${goal.label}` : undefined}
    >
      <Card.Header className={styles.header}>
        <div className={styles.titleRow}>
          <h4 className={styles.title}>{goal.label}</h4>
          {statusBadge}
        </div>
        {goal.description && (
          <p className={styles.description}>{goal.description}</p>
        )}
      </Card.Header>

      <Card.Body className={styles.body}>
        {(goal.baselineEvidence || goal.target) && (
          <dl className={styles.detailGrid}>
            {goal.baselineEvidence && (
              <div className={styles.detailItem}>
                <dt className={styles.detailLabel}>Baseline</dt>
                <dd className={styles.detailValue}>{goal.baselineEvidence}</dd>
              </div>
            )}
            {goal.target && (
              <div className={styles.detailItem}>
                <dt className={styles.detailLabel}>Target</dt>
                <dd className={styles.detailValue}>{goal.target}</dd>
              </div>
            )}
          </dl>
        )}

        {goal.responsibleName && (
          <div className={styles.responsibleRow}>
            <Avatar
              src={goal.responsibleAvatarSrc}
              name={goal.responsibleName}
              alt=""
              size="sm"
            />
            <span className={styles.responsibleName}>{goal.responsibleName}</span>
          </div>
        )}

        {goal.reviewDate && (
          <div
            className={clsx(
              styles.reviewRow,
              overdue && styles.reviewRowOverdue,
            )}
          >
            <CalendarClock aria-hidden="true" className={styles.reviewIcon} />
            <span>Review: {formatTodayOrDate(goal.reviewDate)}</span>
          </div>
        )}

        {hasProgress && (
          <Progress
            value={goal.progress as number}
            label="Goal progress"
            valueText={`${Math.round(goal.progress as number)} percent`}
            size="sm"
            className={styles.progress}
          />
        )}
      </Card.Body>

      {onEdit && (
        <Card.Footer className={styles.footer}>
          <Button
            variant="ghost"
            size="sm"
            className={styles.editBtn}
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(goal);
            }}
            leftIcon={<Pencil aria-hidden="true" className={styles.editIcon} />}
          >
            Edit
          </Button>
        </Card.Footer>
      )}
    </Card>
  );
}
