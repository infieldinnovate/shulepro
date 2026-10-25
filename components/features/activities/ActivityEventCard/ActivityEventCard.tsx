import type { ReactNode } from "react";
import { CalendarDays, MapPin, Users, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import type { BadgeVariant } from "@/components/ui/Badge";
import type { ActivityEvent, ProgrammeStatus } from "@/components/features/activities/types";
import styles from "./ActivityEventCard.module.scss";

export interface ActivityEventCardProps {
  /** Configurable event to display. */
  event: ActivityEvent | null;
  loading?: boolean;
  error?: string;
  /** Optional click handler — makes the card interactive. */
  onSelect?: () => void;
  /** Optional content rendered below the event details. */
  children?: ReactNode;
  className?: string;
}

const STATUS_VARIANT: Record<ProgrammeStatus, BadgeVariant> = {
  planned: "info",
  active: "success",
  paused: "warning",
  completed: "neutral",
  cancelled: "error",
};

const STATUS_LABEL: Record<ProgrammeStatus, string> = {
  planned: "Upcoming",
  active: "In progress",
  paused: "Paused",
  completed: "Completed",
  cancelled: "Cancelled",
};

function formatDate(date: string | Date | undefined): string | null {
  if (!date) return null;
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ActivityEventCard({
  event,
  loading = false,
  error,
  onSelect,
  children,
  className,
}: ActivityEventCardProps) {
  if (loading) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <div className={styles.loadingState}>
          <Spinner size="md" label="Loading event" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <Alert variant="error" title="Unable to load event" description={error} />
      </Card>
    );
  }

  if (!event) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <EmptyState
          icon={<CalendarDays aria-hidden="true" />}
          title="No event"
          description="Event details will appear here once configured."
        />
      </Card>
    );
  }

  const interactive = Boolean(onSelect);
  const dateStr = formatDate(event.date);

  return (
    <Card
      className={clsx(styles.card, interactive && styles.interactive, className)}
      padded
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? onSelect : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect?.();
              }
            }
          : undefined
      }
      aria-label={interactive ? `View ${event.label}` : undefined}
    >
      <Card.Header className={styles.header}>
        <div className={styles.titleRow}>
          <div className={styles.titleGroup}>
            {event.type && (
              <Badge variant="info" size="sm">
                {event.type.label}
              </Badge>
            )}
            <h3 className={styles.title}>{event.label}</h3>
          </div>
          <div className={styles.statusGroup}>
            <Badge variant={STATUS_VARIANT[event.status]} size="sm" dot>
              {STATUS_LABEL[event.status]}
            </Badge>
            {interactive && (
              <ChevronRight aria-hidden="true" className={styles.chevron} />
            )}
          </div>
        </div>
        {event.description && (
          <p className={styles.description}>{event.description}</p>
        )}
      </Card.Header>

      <Card.Body className={styles.body}>
        <div className={styles.metaGrid}>
          {dateStr && (
            <div className={styles.metaItem}>
              <CalendarDays aria-hidden="true" className={styles.metaIcon} />
              <div className={styles.metaContent}>
                <span className={styles.metaLabel}>Date</span>
                <span className={styles.metaValue}>{dateStr}</span>
              </div>
            </div>
          )}
          {event.location && (
            <div className={styles.metaItem}>
              <MapPin aria-hidden="true" className={styles.metaIcon} />
              <div className={styles.metaContent}>
                <span className={styles.metaLabel}>Location</span>
                <span className={styles.metaValue}>{event.location}</span>
              </div>
            </div>
          )}
          {event.participantCount != null && (
            <div className={styles.metaItem}>
              <Users aria-hidden="true" className={styles.metaIcon} />
              <div className={styles.metaContent}>
                <span className={styles.metaLabel}>Participants</span>
                <span className={styles.metaValue}>
                  {event.participantCount.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {children}
      </Card.Body>
    </Card>
  );
}
