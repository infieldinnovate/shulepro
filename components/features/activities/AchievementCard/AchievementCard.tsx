import type { ReactNode } from "react";
import { Award, CalendarDays, FileCheck, UserCheck, User } from "lucide-react";
import clsx from "clsx";
import { Card } from "../../../ui/Card";
import { Badge } from "../../../ui/Badge";
import { Spinner } from "../../../ui/Spinner";
import { Alert } from "../../../ui/Alert";
import { EmptyState } from "../../../ui/EmptyState";
import type { Achievement } from "../types";
import styles from "./AchievementCard.module.scss";

export interface AchievementCardProps {
  /** Verified achievement to display. */
  achievement: Achievement | null;
  loading?: boolean;
  error?: string;
  /** Optional content rendered below the achievement. */
  children?: ReactNode;
  className?: string;
}

function formatDate(date: string | Date | undefined): string | null {
  if (!date) return null;
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function AchievementCard({
  achievement,
  loading = false,
  error,
  children,
  className,
}: AchievementCardProps) {
  if (loading) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <div className={styles.loadingState}>
          <Spinner size="md" label="Loading achievement" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <Alert
          variant="error"
          title="Unable to load achievement"
          description={error}
        />
      </Card>
    );
  }

  if (!achievement) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <EmptyState
          icon={<Award aria-hidden="true" />}
          title="No achievement"
          description="Verified achievements will appear here once recorded."
        />
      </Card>
    );
  }

  const dateStr = formatDate(achievement.date);

  return (
    <Card className={clsx(styles.card, className)} padded>
      <Card.Header className={styles.header}>
        <div className={styles.titleRow}>
          <div className={styles.titleGroup}>
            <Award aria-hidden="true" className={styles.awardIcon} />
            <h3 className={styles.title}>{achievement.title}</h3>
          </div>
          {achievement.level && (
            <Badge variant="primary" size="sm">
              {achievement.level}
            </Badge>
          )}
        </div>
        {achievement.description && (
          <p className={styles.description}>{achievement.description}</p>
        )}
      </Card.Header>

      <Card.Body className={styles.body}>
        <div className={styles.metaGrid}>
          {dateStr && (
            <div className={styles.metaItem}>
              <CalendarDays aria-hidden="true" className={styles.metaIcon} />
              <div className={styles.metaContent}>
                <span className={styles.metaLabel}>Date earned</span>
                <span className={styles.metaValue}>{dateStr}</span>
              </div>
            </div>
          )}
          {achievement.verifier && (
            <div className={styles.metaItem}>
              <UserCheck aria-hidden="true" className={styles.metaIcon} />
              <div className={styles.metaContent}>
                <span className={styles.metaLabel}>Verified by</span>
                <span className={styles.metaValue}>
                  {achievement.verifier}
                  {achievement.verifierRole
                    ? `, ${achievement.verifierRole}`
                    : ""}
                </span>
              </div>
            </div>
          )}
          {achievement.evidenceRef && (
            <div className={styles.metaItem}>
              <FileCheck aria-hidden="true" className={styles.metaIcon} />
              <div className={styles.metaContent}>
                <span className={styles.metaLabel}>Evidence ref</span>
                <span className={styles.metaValue}>{achievement.evidenceRef}</span>
              </div>
            </div>
          )}
          {achievement.recipient && (
            <div className={styles.metaItem}>
              <User aria-hidden="true" className={styles.metaIcon} />
              <div className={styles.metaContent}>
                <span className={styles.metaLabel}>Recipient</span>
                <span className={styles.metaValue}>{achievement.recipient}</span>
              </div>
            </div>
          )}
        </div>

        {!achievement.verifier && (
          <p className={styles.unverifiedNote}>
            This achievement has not yet been verified by a reviewer.
          </p>
        )}

        {children}
      </Card.Body>
    </Card>
  );
}
