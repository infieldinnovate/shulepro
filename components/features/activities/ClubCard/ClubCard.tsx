import type { ReactNode } from "react";
import { Users, MapPin, Clock, User } from "lucide-react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import type { BadgeVariant } from "@/components/ui/Badge";
import type { Club, ProgrammeStatus } from "@/components/features/activities/types";
import styles from "./ClubCard.module.scss";

export interface ClubCardProps {
  /** Configurable club to display. */
  club: Club | null;
  loading?: boolean;
  error?: string;
  /** Optional content rendered below the club details. */
  children?: ReactNode;
  /** Optional click handler for the card. */
  onSelect?: () => void;
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
  planned: "Planned",
  active: "Active",
  paused: "Paused",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function ClubCard({
  club,
  loading = false,
  error,
  children,
  onSelect,
  className,
}: ClubCardProps) {
  if (loading) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <div className={styles.loadingState}>
          <Spinner size="md" label="Loading club" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <Alert variant="error" title="Unable to load club" description={error} />
      </Card>
    );
  }

  if (!club) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <EmptyState
          icon={<Users aria-hidden="true" />}
          title="No club"
          description="Club details will appear here once configured."
        />
      </Card>
    );
  }

  const interactive = Boolean(onSelect);

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
      aria-label={interactive ? `View ${club.label}` : undefined}
    >
      <Card.Header className={styles.header}>
        <div className={styles.titleRow}>
          <div className={styles.titleGroup}>
            {club.category && (
              <Badge variant="neutral" size="sm">
                {club.category}
              </Badge>
            )}
            <h3 className={styles.title}>{club.label}</h3>
          </div>
          <Badge variant={STATUS_VARIANT[club.status]} size="sm" dot>
            {STATUS_LABEL[club.status]}
          </Badge>
        </div>
        {club.description && (
          <p className={styles.description}>{club.description}</p>
        )}
      </Card.Header>

      <Card.Body className={styles.body}>
        <div className={styles.metaGrid}>
          {club.schedule && (
            <div className={styles.metaItem}>
              <Clock aria-hidden="true" className={styles.metaIcon} />
              <div className={styles.metaContent}>
                <span className={styles.metaLabel}>Schedule</span>
                <span className={styles.metaValue}>{club.schedule}</span>
              </div>
            </div>
          )}
          {club.location && (
            <div className={styles.metaItem}>
              <MapPin aria-hidden="true" className={styles.metaIcon} />
              <div className={styles.metaContent}>
                <span className={styles.metaLabel}>Location</span>
                <span className={styles.metaValue}>{club.location}</span>
              </div>
            </div>
          )}
          {club.memberCount != null && (
            <div className={styles.metaItem}>
              <Users aria-hidden="true" className={styles.metaIcon} />
              <div className={styles.metaContent}>
                <span className={styles.metaLabel}>Members</span>
                <span className={styles.metaValue}>
                  {club.memberCount.toLocaleString()}
                </span>
              </div>
            </div>
          )}
          {club.facilitator && (
            <div className={styles.metaItem}>
              <User aria-hidden="true" className={styles.metaIcon} />
              <div className={styles.metaContent}>
                <span className={styles.metaLabel}>Facilitator</span>
                <span className={styles.metaValue}>{club.facilitator}</span>
              </div>
            </div>
          )}
        </div>

        {children}
      </Card.Body>
    </Card>
  );
}
