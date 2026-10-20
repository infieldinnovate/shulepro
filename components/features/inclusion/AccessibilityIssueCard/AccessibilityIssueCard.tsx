import { format } from "date-fns";
import { ShieldAlert, CalendarClock, Pencil, CheckCircle2 } from "lucide-react";
import clsx from "clsx";
import { Card } from "../../../ui/Card";
import { Badge } from "../../../ui/Badge";
import { Spinner } from "../../../ui/Spinner";
import { Alert } from "../../../ui/Alert";
import { EmptyState } from "../../../ui/EmptyState";
import type {
  AccessibilityIssue,
  AccessibilitySeverity,
  AccessibilityIssueStatus,
} from "../types";
import styles from "./AccessibilityIssueCard.module.scss";

export type AccessibilitySeverityBadgeMap = Record<
  AccessibilitySeverity,
  { variant: "neutral" | "info" | "warning" | "error"; label: string }
>;

export type AccessibilityIssueStatusBadgeMap = Record<
  AccessibilityIssueStatus,
  { variant: "neutral" | "info" | "warning" | "success"; label: string }
>;

export const DEFAULT_SEVERITY_BADGE_MAP: AccessibilitySeverityBadgeMap = {
  low: { variant: "neutral", label: "Low" },
  moderate: { variant: "warning", label: "Moderate" },
  high: { variant: "error", label: "High" },
};

export const DEFAULT_ISSUE_STATUS_BADGE_MAP: AccessibilityIssueStatusBadgeMap = {
  identified: { variant: "info", label: "Identified" },
  "being-addressed": { variant: "warning", label: "Being addressed" },
  resolved: { variant: "success", label: "Resolved" },
  monitoring: { variant: "neutral", label: "Monitoring" },
};

export interface AccessibilityIssueCardProps {
  issue: AccessibilityIssue | null;
  severityBadgeMap?: AccessibilitySeverityBadgeMap;
  statusBadgeMap?: AccessibilityIssueStatusBadgeMap;
  /** When provided, clicking the card calls this handler. */
  onSelect?: (issue: AccessibilityIssue) => void;
  /** When provided, an edit button is rendered. */
  onEdit?: (issue: AccessibilityIssue) => void;
  /** When provided, a resolve button is rendered. */
  onResolve?: (issue: AccessibilityIssue) => void;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  disabled?: boolean;
  className?: string;
}

function toDate(d: Date | string): Date {
  return typeof d === "string" ? new Date(d) : d;
}

export function AccessibilityIssueCard({
  issue,
  severityBadgeMap = DEFAULT_SEVERITY_BADGE_MAP,
  statusBadgeMap = DEFAULT_ISSUE_STATUS_BADGE_MAP,
  onSelect,
  onEdit,
  onResolve,
  loading = false,
  error,
  empty = false,
  disabled = false,
  className,
}: AccessibilityIssueCardProps) {
  if (loading) {
    return (
      <Card className={clsx(styles.card, styles.loadingCard, className)} padded>
        <div className={styles.loadingBody}>
          <Spinner size="md" label="Loading accessibility barrier" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <Alert
          variant="error"
          title="Unable to load accessibility barrier"
          description={error}
        />
      </Card>
    );
  }

  if (empty || !issue) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <EmptyState
          icon={<ShieldAlert aria-hidden="true" />}
          title="No accessibility barriers"
          description="There are no accessibility barriers to display yet."
        />
      </Card>
    );
  }

  const clickable = typeof onSelect === "function" && !disabled;
  const sevMap = severityBadgeMap[issue.severity];
  const statMap = statusBadgeMap[issue.status];

  return (
    <Card
      className={clsx(
        styles.card,
        clickable && styles.interactive,
        disabled && styles.disabled,
        className,
      )}
      padded
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? () => onSelect?.(issue) : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect?.(issue);
              }
            }
          : undefined
      }
      aria-label={clickable ? `View barrier: ${issue.area}` : undefined}
    >
      <Card.Header className={styles.header}>
        <div className={styles.titleRow}>
          <div className={styles.titleGroup}>
            <ShieldAlert aria-hidden="true" className={styles.titleIcon} />
            <h4 className={styles.title}>{issue.area}</h4>
          </div>
          <div className={styles.badgeRow}>
            {sevMap && (
              <Badge variant={sevMap.variant} size="sm">
                {sevMap.label}
              </Badge>
            )}
            {statMap && (
              <Badge variant={statMap.variant} size="sm" dot>
                {statMap.label}
              </Badge>
            )}
          </div>
        </div>
      </Card.Header>

      <Card.Body className={styles.body}>
        <p className={styles.description}>{issue.description}</p>

        <dl className={styles.metaGrid}>
          {issue.ownerName && (
            <div className={styles.metaItem}>
              <dt className={styles.metaLabel}>Owner</dt>
              <dd className={styles.metaValue}>{issue.ownerName}</dd>
            </div>
          )}
          {issue.identifiedDate && (
            <div className={styles.metaItem}>
              <dt className={styles.metaLabel}>Identified</dt>
              <dd className={styles.metaValue}>
                <CalendarClock aria-hidden="true" className={styles.metaIcon} />
                {format(toDate(issue.identifiedDate), "MMM d, yyyy")}
              </dd>
            </div>
          )}
          {issue.resolvedDate && (
            <div className={styles.metaItem}>
              <dt className={styles.metaLabel}>Resolved</dt>
              <dd className={styles.metaValue}>
                <CheckCircle2 aria-hidden="true" className={styles.metaIcon} />
                {format(toDate(issue.resolvedDate), "MMM d, yyyy")}
              </dd>
            </div>
          )}
        </dl>

        {issue.notes && <p className={styles.notes}>{issue.notes}</p>}
      </Card.Body>

      {(onEdit || onResolve) && (
        <Card.Footer className={styles.footer}>
          {onResolve && issue.status !== "resolved" && (
            <button
              type="button"
              className={clsx(styles.actionBtn, styles.resolveBtn)}
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                onResolve(issue);
              }}
            >
              <CheckCircle2 aria-hidden="true" className={styles.actionIcon} />
              Mark resolved
            </button>
          )}
          {onEdit && (
            <button
              type="button"
              className={styles.actionBtn}
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(issue);
              }}
            >
              <Pencil aria-hidden="true" className={styles.actionIcon} />
              Edit
            </button>
          )}
        </Card.Footer>
      )}
    </Card>
  );
}
