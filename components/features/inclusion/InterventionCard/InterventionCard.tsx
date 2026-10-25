import { format } from "date-fns";
import { Pencil, CalendarRange, Sparkles } from "lucide-react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { StatusBadgeMap } from "@/components/shared/StatusBadge";
import type { Intervention, InterventionStatus } from "@/components/features/inclusion/types";
import styles from "./InterventionCard.module.scss";

export type InterventionStatusBadgeMap = StatusBadgeMap<InterventionStatus>;

export const DEFAULT_INTERVENTION_STATUS_MAP: InterventionStatusBadgeMap = {
  planned: { variant: "neutral", label: "Planned", dot: true },
  active: { variant: "info", label: "Active", dot: true },
  paused: { variant: "warning", label: "Paused", dot: true },
  completed: { variant: "success", label: "Completed", dot: true },
  discontinued: { variant: "neutral", label: "Discontinued" },
};

export interface InterventionCardProps {
  intervention: Intervention | null;
  statusMap?: InterventionStatusBadgeMap;
  /** Display names for linked goal refs (caller-provided). */
  linkedGoalLabels?: string[];
  onSelect?: (intervention: Intervention) => void;
  onEdit?: (intervention: Intervention) => void;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  disabled?: boolean;
  className?: string;
}

function toDate(d: Date | string): Date {
  return typeof d === "string" ? new Date(d) : d;
}

function dateRange(start?: Date | string, end?: Date | string): string | null {
  if (!start && !end) return null;
  const parts: string[] = [];
  if (start) parts.push(format(toDate(start), "MMM d, yyyy"));
  if (end) parts.push(format(toDate(end), "MMM d, yyyy"));
  return parts.join(" \u2013 ");
}

export function InterventionCard({
  intervention,
  statusMap = DEFAULT_INTERVENTION_STATUS_MAP,
  linkedGoalLabels,
  onSelect,
  onEdit,
  loading = false,
  error,
  empty = false,
  disabled = false,
  className,
}: InterventionCardProps) {
  if (loading) {
    return (
      <Card className={clsx(styles.card, styles.loadingCard, className)} padded>
        <div className={styles.loadingBody}>
          <Spinner size="md" label="Loading intervention" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <Alert
          variant="error"
          title="Unable to load intervention"
          description={error}
        />
      </Card>
    );
  }

  if (empty || !intervention) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <EmptyState
          icon={<Sparkles aria-hidden="true" />}
          title="No intervention"
          description="There is no intervention to display yet."
        />
      </Card>
    );
  }

  const clickable = typeof onSelect === "function" && !disabled;
  const range = dateRange(intervention.startDate, intervention.endDate);

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
      onClick={clickable ? () => onSelect?.(intervention) : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect?.(intervention);
              }
            }
          : undefined
      }
      aria-label={clickable ? `View intervention: ${intervention.label}` : undefined}
    >
      <Card.Header className={styles.header}>
        <div className={styles.titleRow}>
          <h4 className={styles.title}>{intervention.label}</h4>
          <StatusBadge
            status={intervention.status}
            statusMap={statusMap}
            size="sm"
          />
        </div>
        {intervention.approach && (
          <Badge variant="neutral" size="sm">
            {intervention.approach}
          </Badge>
        )}
      </Card.Header>

      <Card.Body className={styles.body}>
        {intervention.description && (
          <p className={styles.description}>{intervention.description}</p>
        )}

        <dl className={styles.metaGrid}>
          {intervention.responsibleName && (
            <div className={styles.metaItem}>
              <dt className={styles.metaLabel}>Responsible</dt>
              <dd className={styles.metaValue}>
                <Avatar
                  name={intervention.responsibleName}
                  alt=""
                  size="sm"
                />
                {intervention.responsibleName}
              </dd>
            </div>
          )}
          {range && (
            <div className={styles.metaItem}>
              <dt className={styles.metaLabel}>Timeline</dt>
              <dd className={styles.metaValue}>
                <CalendarRange aria-hidden="true" className={styles.metaIcon} />
                {range}
              </dd>
            </div>
          )}
        </dl>

        {linkedGoalLabels && linkedGoalLabels.length > 0 && (
          <div className={styles.goalLinks}>
            <span className={styles.goalLinksLabel}>Linked goals:</span>
            <div className={styles.goalTags}>
              {linkedGoalLabels.map((label, index) => (
                <Badge key={index} variant="info" size="sm">
                  {label}
                </Badge>
              ))}
            </div>
          </div>
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
              onEdit(intervention);
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
