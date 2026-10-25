import type { ReactNode } from "react";
import { CalendarDays, Users, Target } from "lucide-react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import type { BadgeVariant } from "@/components/ui/Badge";
import type { Programme, ProgrammeStatus } from "@/components/features/activities/types";
import styles from "./ProgrammeCard.module.scss";

export interface ProgrammeCardProps {
  /** Configurable programme to display. */
  programme: Programme | null;
  loading?: boolean;
  error?: string;
  /** Optional content rendered below the programme details. */
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
  planned: "Planned",
  active: "Active",
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

export function ProgrammeCard({
  programme,
  loading = false,
  error,
  children,
  className,
}: ProgrammeCardProps) {
  if (loading) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <div className={styles.loadingState}>
          <Spinner size="md" label="Loading programme" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <Alert
          variant="error"
          title="Unable to load programme"
          description={error}
        />
      </Card>
    );
  }

  if (!programme) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <EmptyState
          icon={<Target aria-hidden="true" />}
          title="No programme"
          description="Programme details will appear here once configured."
        />
      </Card>
    );
  }

  const start = formatDate(programme.startDate);
  const end = formatDate(programme.endDate);

  return (
    <Card className={clsx(styles.card, className)} padded>
      <Card.Header className={styles.header}>
        <div className={styles.titleRow}>
          <div className={styles.titleGroup}>
            {programme.type && (
              <Badge variant="neutral" size="sm">
                {programme.type}
              </Badge>
            )}
            <h3 className={styles.title}>{programme.label}</h3>
          </div>
          <Badge variant={STATUS_VARIANT[programme.status]} size="sm" dot>
            {STATUS_LABEL[programme.status]}
          </Badge>
        </div>
        {programme.description && (
          <p className={styles.description}>{programme.description}</p>
        )}
      </Card.Header>

      <Card.Body className={styles.body}>
        <div className={styles.metaGrid}>
          {(start || end) && (
            <div className={styles.metaItem}>
              <CalendarDays aria-hidden="true" className={styles.metaIcon} />
              <div className={styles.metaContent}>
                <span className={styles.metaLabel}>Duration</span>
                <span className={styles.metaValue}>
                  {start && end
                    ? `${start} – ${end}`
                    : start
                      ? `From ${start}`
                      : `Until ${end}`}
                </span>
              </div>
            </div>
          )}
          {programme.participantCount != null && (
            <div className={styles.metaItem}>
              <Users aria-hidden="true" className={styles.metaIcon} />
              <div className={styles.metaContent}>
                <span className={styles.metaLabel}>Participants</span>
                <span className={styles.metaValue}>
                  {programme.participantCount.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {programme.objectives.length > 0 && (
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Objectives</h4>
            <ul className={styles.objectiveList}>
              {programme.objectives.map((obj) => (
                <li key={obj.id} className={styles.objectiveItem}>
                  <Target aria-hidden="true" className={styles.objectiveIcon} />
                  <div className={styles.objectiveContent}>
                    <span className={styles.objectiveLabel}>{obj.label}</span>
                    {obj.description && (
                      <span className={styles.objectiveDescription}>
                        {obj.description}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {programme.audiences.length > 0 && (
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Audience</h4>
            <div className={styles.audienceChips}>
              {programme.audiences.map((aud) => (
                <Badge key={aud.id} variant="info" size="sm">
                  {aud.label}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {children}
      </Card.Body>
    </Card>
  );
}
