import type { ReactNode } from "react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Briefcase, CalendarClock, UserX } from "lucide-react";
import type { StaffAssignment, DisabledState } from "@/components/features/engagement/models";
import { formatDate } from "@/lib/formatTime";
import styles from "./StaffAssignmentCard.module.scss";

export interface StaffAssignmentCardProps {
  /** The assignment data — all fields are configurable via props. */
  assignment?: StaffAssignment | null;
  /** Optional status badge slot — caller controls the badge. */
  status?: ReactNode;
  /** Optional action slot (e.g. edit button). */
  actions?: ReactNode;
  /** Loading state — shows a spinner. */
  loading?: boolean;
  /** Error message — shows an error alert. */
  error?: string;
  /** Empty state — shows an empty placeholder. */
  empty?: boolean;
  /** Disabled state — dims the card and shows a reason. */
  disabled?: DisabledState;
  className?: string;
}

export function StaffAssignmentCard({
  assignment,
  status,
  actions,
  loading = false,
  error,
  empty = false,
  disabled,
  className,
}: StaffAssignmentCardProps) {
  if (loading) {
    return (
      <Card padded className={clsx(styles.loading, className)}>
        <Spinner size="md" label="Loading assignment" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card padded className={className}>
        <Alert variant="error" title="Assignment unavailable" description={error} />
      </Card>
    );
  }

  if (empty || !assignment) {
    return (
      <Card padded className={clsx(styles.empty, className)}>
        <EmptyState
          icon={<UserX aria-hidden="true" />}
          title="No assignment"
          description="No staff assignment to display."
        />
      </Card>
    );
  }

  const isDisabled = Boolean(disabled?.disabled);

  const startLabel = formatDate(assignment.startDate);
  const endLabel = formatDate(assignment.endDate);
  const scheduleLabel =
    startLabel || endLabel
      ? [startLabel || "?", endLabel || "Present"].join(" — ")
      : null;

  return (
    <Card
      padded={false}
      className={clsx(
        styles.card,
        isDisabled && styles.disabled,
        className,
      )}
      aria-disabled={isDisabled || undefined}
    >
      <div className={styles.body}>
        <div className={styles.header}>
          <span className={styles.typeIcon}>
            <Briefcase aria-hidden="true" />
          </span>
          <div className={styles.headerInfo}>
            <p className={styles.type}>{assignment.type}</p>
            <p className={styles.target}>{assignment.targetLabel}</p>
          </div>
          {status && <span className={styles.status}>{status}</span>}
        </div>

        {assignment.staffName && (
          <p className={styles.staffName}>{assignment.staffName}</p>
        )}

        {scheduleLabel && (
          <div className={styles.schedule}>
            <span className={styles.scheduleIcon}>
              <CalendarClock aria-hidden="true" />
            </span>
            <time className={styles.scheduleText}>{scheduleLabel}</time>
          </div>
        )}

        {isDisabled && disabled?.disabledReason && (
          <p className={styles.disabledReason}>{disabled.disabledReason}</p>
        )}
      </div>

      {(actions || assignment.active !== undefined) && (
        <div className={styles.footer}>
          {assignment.active !== undefined && !status && (
            <Badge
              variant={assignment.active ? "success" : "neutral"}
              dot
              size="sm"
            >
              {assignment.active ? "Active" : "Inactive"}
            </Badge>
          )}
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      )}
    </Card>
  );
}
