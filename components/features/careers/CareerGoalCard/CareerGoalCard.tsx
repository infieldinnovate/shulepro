import type { KeyboardEvent, ReactNode } from "react";
import { isPast, isToday } from "date-fns";
import { CalendarClock, Target, Pencil } from "lucide-react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Progress } from "@/components/ui/Progress";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { StatusBadgeMap } from "@/components/shared/StatusBadge";
import type { CareerGoal, CareerGoalStatus } from "@/components/features/careers/types";
import { formatDateShort } from "@/lib/formatTime";
import styles from "./CareerGoalCard.module.scss";

export type CareerGoalStatusBadgeMap = StatusBadgeMap<CareerGoalStatus>;

export const DEFAULT_CAREER_GOAL_STATUS_MAP: CareerGoalStatusBadgeMap = {
  "not-started": { variant: "neutral", label: "Not started", dot: true },
  "in-progress": { variant: "info", label: "In progress", dot: true },
  "on-track": { variant: "success", label: "On track", dot: true },
  achieved: { variant: "success", label: "Achieved", dot: true },
  paused: { variant: "warning", label: "Paused", dot: true },
  discontinued: { variant: "neutral", label: "Discontinued" },
};

export interface CareerGoalCardProps {
  goal: CareerGoal | null;
  /** Optional status badge map (defaults to standard career goal statuses). */
  statusMap?: CareerGoalStatusBadgeMap;
  /** When provided, clicking the card calls this handler. */
  onSelect?: (goal: CareerGoal) => void;
  /** When provided, an edit button is rendered. */
  onEdit?: (goal: CareerGoal) => void;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  disabled?: boolean;
  className?: string;
  /** Optional content rendered in the footer (e.g. actions). */
  footer?: ReactNode;
}

function toDate(d: Date | string): Date {
  return typeof d === "string" ? new Date(d) : d;
}

function formatDate(d: Date | string): string {
  const date = toDate(d);
  if (isToday(date)) return "Today";
  return formatDateShort(d);
}

function isReviewOverdue(goal: CareerGoal): boolean {
  if (!goal.reviewDate) return false;
  if (goal.status === "achieved" || goal.status === "discontinued") return false;
  const d = toDate(goal.reviewDate);
  return isPast(d) && !isToday(d);
}

export function CareerGoalCard({
  goal,
  statusMap = DEFAULT_CAREER_GOAL_STATUS_MAP,
  onSelect,
  onEdit,
  loading = false,
  error,
  empty = false,
  disabled = false,
  className,
  footer,
}: CareerGoalCardProps) {
  if (loading) {
    return (
      <Card className={clsx(styles.card, styles.loadingCard, className)} padded>
        <div className={styles.loadingBody}>
          <Spinner size="md" label="Loading career goal" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <Alert
          variant="error"
          title="Unable to load career goal"
          description={error}
        />
      </Card>
    );
  }

  if (empty || !goal) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <EmptyState
          icon={<Target aria-hidden="true" />}
          title="No career goal"
          description="There is no career goal to display yet."
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
      aria-label={clickable ? `View goal: ${goal.title}` : undefined}
    >
      <Card.Header className={styles.header}>
        <div className={styles.titleRow}>
          <h4 className={styles.title}>{goal.title}</h4>
          <StatusBadge
            status={goal.status}
            statusMap={statusMap}
            size="sm"
          />
        </div>
        {goal.description && (
          <p className={styles.description}>{goal.description}</p>
        )}
      </Card.Header>

      <Card.Body className={styles.body}>
        {goal.target && (
          <div className={styles.targetRow}>
            <Target aria-hidden="true" className={styles.targetIcon} />
            <span className={styles.targetText}>{goal.target}</span>
          </div>
        )}

        {goal.targetDate && (
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Target date</span>
            <span className={styles.metaValue}>
              {formatDate(goal.targetDate)}
            </span>
          </div>
        )}

        {goal.reviewDate && (
          <div
            className={clsx(
              styles.metaRow,
              overdue && styles.metaRowOverdue,
            )}
          >
            <CalendarClock aria-hidden="true" className={styles.metaIcon} />
            <span className={styles.metaLabel}>Review</span>
            <span className={styles.metaValue}>
              {formatDate(goal.reviewDate)}
              {overdue && <span className={styles.overdueTag}>Overdue</span>}
            </span>
          </div>
        )}

        {goal.supporterName && (
          <div className={styles.supporterRow}>
            <Avatar
              src={goal.supporterAvatarSrc}
              name={goal.supporterName}
              alt=""
              size="sm"
            />
            <span className={styles.supporterName}>{goal.supporterName}</span>
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

      {(onEdit || footer) && (
        <Card.Footer className={styles.footer}>
          <div className={styles.footerContent}>{footer}</div>
          {onEdit && (
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
          )}
        </Card.Footer>
      )}
    </Card>
  );
}
