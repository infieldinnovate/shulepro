import type { ReactNode } from "react";
import clsx from "clsx";
import { Card } from "../../../ui/Card";
import { Badge } from "../../../ui/Badge";
import { Spinner } from "../../../ui/Spinner";
import { Alert } from "../../../ui/Alert";
import { EmptyState } from "../../../ui/EmptyState";
import { BookOpen, Clock, Layers, GraduationCap } from "lucide-react";
import type { TrainingCourse, DisabledState } from "../models";
import styles from "./TrainingCourseCard.module.scss";

export interface TrainingCourseCardProps {
  /** Course data — all configurable via props. */
  course?: TrainingCourse | null;
  /** Optional status badge slot — overrides the default. */
  status?: ReactNode;
  /** Action slot (e.g. enroll button). */
  actions?: ReactNode;
  /** Loading state. */
  loading?: boolean;
  /** Error message. */
  error?: string;
  /** Empty state. */
  empty?: boolean;
  /** Disabled state. */
  disabled?: DisabledState;
  className?: string;
}

const STATUS_VARIANT: Record<string, "neutral" | "primary" | "success" | "warning"> = {
  draft: "neutral",
  scheduled: "primary",
  active: "success",
  completed: "success",
  cancelled: "warning",
};

export function TrainingCourseCard({
  course,
  status,
  actions,
  loading = false,
  error,
  empty = false,
  disabled,
  className,
}: TrainingCourseCardProps) {
  if (loading) {
    return (
      <Card padded className={clsx(styles.loading, className)}>
        <Spinner size="md" label="Loading course" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card padded className={className}>
        <Alert variant="error" title="Course unavailable" description={error} />
      </Card>
    );
  }

  if (empty || !course) {
    return (
      <Card padded className={clsx(styles.empty, className)}>
        <EmptyState
          icon={<BookOpen aria-hidden="true" />}
          title="No course"
          description="No training course to display."
        />
      </Card>
    );
  }

  const isDisabled = Boolean(disabled?.disabled);
  const moduleCount = course.modules.length;
  const statusVariant = STATUS_VARIANT[course.status] ?? "neutral";

  return (
    <Card
      padded={false}
      className={clsx(styles.card, isDisabled && styles.disabled, className)}
      aria-disabled={isDisabled || undefined}
    >
      <div className={styles.body}>
        <div className={styles.header}>
          <span className={styles.icon}>
            <GraduationCap aria-hidden="true" />
          </span>
          <div className={styles.headerInfo}>
            <h3 className={styles.title}>{course.title}</h3>
            {course.category && (
              <p className={styles.category}>{course.category}</p>
            )}
          </div>
          <span className={styles.status}>
            {status ?? (
              <Badge variant={statusVariant} dot size="sm">
                {course.status}
              </Badge>
            )}
          </span>
        </div>

        {course.description && (
          <p className={styles.description}>{course.description}</p>
        )}

        <div className={styles.meta}>
          <span className={styles.metaItem}>
            <Layers aria-hidden="true" />
            <span>
              {moduleCount} {moduleCount === 1 ? "module" : "modules"}
            </span>
          </span>
          {course.durationLabel && (
            <span className={styles.metaItem}>
              <Clock aria-hidden="true" />
              <span>{course.durationLabel}</span>
            </span>
          )}
          {course.deliveryMode && (
            <span className={styles.metaItem}>
              <span className={styles.metaDot} aria-hidden="true" />
              <span>{course.deliveryMode}</span>
            </span>
          )}
          {course.enrolledCount != null && (
            <span className={styles.metaItem}>
              <span className={styles.metaDot} aria-hidden="true" />
              <span>{course.enrolledCount} enrolled</span>
            </span>
          )}
        </div>

        {course.provider && <p className={styles.provider}>{course.provider}</p>}

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
