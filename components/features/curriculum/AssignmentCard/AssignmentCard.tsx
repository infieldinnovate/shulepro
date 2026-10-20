import type { ReactNode } from "react";
import { CalendarClock, BookOpen, User } from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import clsx from "clsx";
import { Card } from "../../../ui/Card";
import { Progress } from "../../../ui/Progress";
import { Spinner } from "../../../ui/Spinner";
import { Alert } from "../../../ui/Alert";
import { EmptyState } from "../../../ui/EmptyState";
import { StatusBadge } from "../../../shared/StatusBadge";
import { AttachmentList } from "../../../shared/AttachmentList";
import type { Attachment } from "../../../shared/AttachmentList";
import type {
  Assignment,
  AssignmentStatus,
} from "../types";
import styles from "./AssignmentCard.module.scss";

export interface AssignmentCardProps {
  assignment: Assignment;
  onSelect?: (assignment: Assignment) => void;
  onSubmit?: (assignment: Assignment) => void;
  /** Optional action slot rendered in the footer. */
  actions?: ReactNode;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  className?: string;
}

const STATUS_MAP = {
  "not-started": { variant: "neutral" as const, label: "Not started", dot: true },
  "in-progress": { variant: "info" as const, label: "In progress", dot: true },
  submitted: { variant: "primary" as const, label: "Submitted", dot: true },
  graded: { variant: "success" as const, label: "Graded", dot: true },
  overdue: { variant: "error" as const, label: "Overdue", dot: true },
  draft: { variant: "neutral" as const, label: "Draft" },
};

function formatDueDate(date: Date): string {
  if (isToday(date)) return `Today, ${format(date, "h:mm a")}`;
  return format(date, "EEE, MMM d, yyyy");
}

function isOverdue(assignment: Assignment): boolean {
  if (assignment.status === "overdue" || assignment.status === "graded" || assignment.status === "submitted")
    return false;
  return isPast(assignment.dueDate) && !isToday(assignment.dueDate);
}

export function AssignmentCard({
  assignment,
  onSelect,
  onSubmit,
  actions,
  loading = false,
  error,
  empty = false,
  className,
}: AssignmentCardProps) {
  if (loading) {
    return (
      <Card className={clsx(styles.card, styles.loadingCard, className)} padded>
        <div className={styles.loadingBody}>
          <Spinner size="md" label="Loading assignment" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <Alert
          variant="error"
          title="Unable to load assignment"
          description={error}
        />
      </Card>
    );
  }

  if (empty || !assignment) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <EmptyState
          icon={<CalendarClock aria-hidden="true" />}
          title="No assignment"
          description="There is no assignment to display."
        />
      </Card>
    );
  }

  const overdue = isOverdue(assignment);
  const status: AssignmentStatus = overdue ? "overdue" : assignment.status;
  const hasProgress =
    assignment.progress != null &&
    !Number.isNaN(assignment.progress) &&
    assignment.progress >= 0 &&
    assignment.progress <= 100;
  const interactive = Boolean(onSelect);
  const attachments: Attachment[] = (assignment.attachments ?? []).map((a) => ({
    id: a.id,
    name: a.name,
    size: a.size,
    type: a.type,
    url: a.url,
    uploadedAt: a.uploadedAt,
    uploadedBy: a.uploadedBy,
  }));

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
      onClick={interactive ? () => onSelect?.(assignment) : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect?.(assignment);
              }
            }
          : undefined
      }
      aria-label={interactive ? `View assignment: ${assignment.title}` : undefined}
    >
      <Card.Header className={styles.header}>
        <div className={styles.titleRow}>
          <h4 className={styles.title}>{assignment.title}</h4>
          <StatusBadge status={status} statusMap={STATUS_MAP} size="sm" />
        </div>
        <div className={styles.metaRow}>
          <span className={styles.metaItem}>
            <BookOpen aria-hidden="true" className={styles.metaIcon} />
            {assignment.learningArea}
          </span>
          {assignment.classLabel && (
            <span className={styles.metaItem}>{assignment.classLabel}</span>
          )}
          {assignment.teacher && (
            <span className={styles.metaItem}>
              <User aria-hidden="true" className={styles.metaIcon} />
              {assignment.teacher}
            </span>
          )}
        </div>
      </Card.Header>

      <Card.Body className={styles.body}>
        <div className={clsx(styles.dueDate, overdue && styles.dueDateOverdue)}>
          <CalendarClock aria-hidden="true" className={styles.dueIcon} />
          <span>Due: {formatDueDate(assignment.dueDate)}</span>
        </div>

        {assignment.description && (
          <p className={styles.description}>{assignment.description}</p>
        )}

        {hasProgress && (
          <Progress
            value={assignment.progress as number}
            label="Completion progress"
            valueText={`${Math.round(assignment.progress as number)} percent complete`}
            size="sm"
            className={styles.progress}
          />
        )}

        {attachments.length > 0 && (
          <AttachmentList
            attachments={attachments}
            ariaLabel="Assignment attachments"
            className={styles.attachments}
          />
        )}
      </Card.Body>

      {(onSubmit || actions) && (
        <Card.Footer className={styles.footer}>
          {actions}
          {onSubmit && (
            <button
              type="button"
              className={styles.submitBtn}
              onClick={(e) => {
                e.stopPropagation();
                onSubmit(assignment);
              }}
            >
              Submit
            </button>
          )}
        </Card.Footer>
      )}
    </Card>
  );
}
