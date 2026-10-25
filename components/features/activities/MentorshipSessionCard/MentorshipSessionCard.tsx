import type { ReactNode } from "react";
import { CalendarDays, Target, FileText } from "lucide-react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { StatusBadgeMap } from "@/components/shared/StatusBadge";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import type { MentorshipSession, ProgrammeStatus } from "@/components/features/activities/types";
import { formatDateMedium } from "@/lib/formatTime";
import styles from "./MentorshipSessionCard.module.scss";

export interface MentorshipSessionCardProps {
  /** Configurable mentorship session to display. */
  session: MentorshipSession | null;
  loading?: boolean;
  error?: string;
  /** Configurable status badge map. */
  statusMap?: StatusBadgeMap<ProgrammeStatus>;
  /** Optional content rendered below the session details. */
  children?: ReactNode;
  className?: string;
}

const DEFAULT_STATUS_MAP: StatusBadgeMap<ProgrammeStatus> = {
  planned: { variant: "info", label: "Scheduled", dot: true },
  active: { variant: "success", label: "In progress", dot: true },
  paused: { variant: "warning", label: "Paused", dot: true },
  completed: { variant: "neutral", label: "Completed", dot: true },
  cancelled: { variant: "error", label: "Cancelled", dot: true },
};

export function MentorshipSessionCard({
  session,
  loading = false,
  error,
  statusMap = DEFAULT_STATUS_MAP,
  children,
  className,
}: MentorshipSessionCardProps) {
  if (loading) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <div className={styles.loadingState}>
          <Spinner size="md" label="Loading mentorship session" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <Alert
          variant="error"
          title="Unable to load mentorship session"
          description={error}
        />
      </Card>
    );
  }

  if (!session) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <EmptyState
          icon={<Target aria-hidden="true" />}
          title="No mentorship session"
          description="Session details will appear here once configured."
        />
      </Card>
    );
  }

  const dateStr = formatDateMedium(session.date);

  return (
    <Card className={clsx(styles.card, className)} padded>
      <Card.Header className={styles.header}>
        <div className={styles.peopleRow}>
          <div className={styles.person}>
            <Avatar
              src={session.mentor.avatarSrc}
              name={session.mentor.name}
              size="md"
            />
            <div className={styles.personInfo}>
              <span className={styles.personName}>{session.mentor.name}</span>
              <span className={styles.personRole}>
                {session.mentor.role ?? "Mentor"}
              </span>
            </div>
          </div>
          <span className={styles.arrow} aria-hidden="true">
            &rarr;
          </span>
          <div className={styles.person}>
            <Avatar
              src={session.mentee.avatarSrc}
              name={session.mentee.name}
              size="md"
            />
            <div className={styles.personInfo}>
              <span className={styles.personName}>{session.mentee.name}</span>
              <span className={styles.personRole}>
                {session.mentee.role ?? "Mentee"}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.statusRow}>
          <StatusBadge status={session.status} statusMap={statusMap} size="sm" />
        </div>
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
          {session.focus && (
            <div className={styles.metaItem}>
              <Target aria-hidden="true" className={styles.metaIcon} />
              <div className={styles.metaContent}>
                <span className={styles.metaLabel}>Focus</span>
                <span className={styles.metaValue}>{session.focus}</span>
              </div>
            </div>
          )}
        </div>

        {session.outcomes && (
          <div className={styles.outcomesSection}>
            <div className={styles.outcomesHeader}>
              <FileText aria-hidden="true" className={styles.outcomesIcon} />
              <span className={styles.outcomesLabel}>Outcomes</span>
            </div>
            <p className={styles.outcomesText}>{session.outcomes}</p>
          </div>
        )}

        {children}
      </Card.Body>
    </Card>
  );
}
