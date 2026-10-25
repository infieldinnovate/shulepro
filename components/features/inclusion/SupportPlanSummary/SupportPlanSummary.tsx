import type { ReactNode } from "react";
import { format, isPast, isToday } from "date-fns";
import { CalendarClock, FileText, Target } from "lucide-react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import type { SupportPlan } from "@/components/features/inclusion/types";
import styles from "./SupportPlanSummary.module.scss";

export interface SupportPlanSummaryProps {
  plan: SupportPlan | null;
  /** Display name for the plan owner (looked up from ownerRef by caller). */
  ownerName?: string;
  /** Number of goals in the plan. */
  goalCount?: number;
  /** Optional status badge node (caller provides a StatusBadge or similar). */
  statusBadge?: ReactNode;
  /** Optional action slot rendered in the card footer. */
  actions?: ReactNode;
  /** When provided, clicking the card calls this handler. */
  onSelect?: (plan: SupportPlan) => void;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  className?: string;
}

function formatReviewDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isToday(d)) return "Today";
  return format(d, "EEE, MMM d, yyyy");
}

function isReviewOverdue(plan: SupportPlan): boolean {
  if (!plan.reviewDate) return false;
  if (plan.status === "completed" || plan.status === "archived") return false;
  const d =
    typeof plan.reviewDate === "string" ? new Date(plan.reviewDate) : plan.reviewDate;
  return isPast(d) && !isToday(d);
}

export function SupportPlanSummary({
  plan,
  ownerName,
  goalCount,
  statusBadge,
  actions,
  onSelect,
  loading = false,
  error,
  empty = false,
  className,
}: SupportPlanSummaryProps) {
  if (loading) {
    return (
      <Card className={clsx(styles.card, styles.loadingCard, className)} padded>
        <div className={styles.loadingBody}>
          <Spinner size="md" label="Loading support plan" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <Alert
          variant="error"
          title="Unable to load support plan"
          description={error}
        />
      </Card>
    );
  }

  if (empty || !plan) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <EmptyState
          icon={<Target aria-hidden="true" />}
          title="No support plan"
          description="There is no support plan to display yet."
        />
      </Card>
    );
  }

  const interactive = typeof onSelect === "function";
  const overdue = isReviewOverdue(plan);

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
      onClick={interactive ? () => onSelect?.(plan) : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect?.(plan);
              }
            }
          : undefined
      }
      aria-label={interactive ? `View support plan: ${plan.title}` : undefined}
    >
      <Card.Header className={styles.header}>
        <div className={styles.titleRow}>
          <h4 className={styles.title}>{plan.title}</h4>
          {statusBadge}
        </div>
        {plan.summary && (
          <p className={styles.summary}>{plan.summary}</p>
        )}
      </Card.Header>

      <Card.Body className={styles.body}>
        <dl className={styles.metaGrid}>
          {ownerName && (
            <div className={styles.metaItem}>
              <dt className={styles.metaLabel}>Coordinator</dt>
              <dd className={styles.metaValue}>{ownerName}</dd>
            </div>
          )}
          {plan.reviewDate && (
            <div className={styles.metaItem}>
              <dt className={styles.metaLabel}>Next review</dt>
              <dd
                className={clsx(
                  styles.metaValue,
                  overdue && styles.metaValueOverdue,
                )}
              >
                <CalendarClock aria-hidden="true" className={styles.metaIcon} />
                {formatReviewDate(plan.reviewDate)}
              </dd>
            </div>
          )}
          {typeof goalCount === "number" && (
            <div className={styles.metaItem}>
              <dt className={styles.metaLabel}>Goals</dt>
              <dd className={styles.metaValue}>
                <Target aria-hidden="true" className={styles.metaIcon} />
                {goalCount}
              </dd>
            </div>
          )}
          {plan.startDate && (
            <div className={styles.metaItem}>
              <dt className={styles.metaLabel}>Start date</dt>
              <dd className={styles.metaValue}>
                <FileText aria-hidden="true" className={styles.metaIcon} />
                {format(
                  typeof plan.startDate === "string"
                    ? new Date(plan.startDate)
                    : plan.startDate,
                  "MMM d, yyyy",
                )}
              </dd>
            </div>
          )}
        </dl>
      </Card.Body>

      {actions && (
        <Card.Footer className={styles.footer}>{actions}</Card.Footer>
      )}
    </Card>
  );
}
