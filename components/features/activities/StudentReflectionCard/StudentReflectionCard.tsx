import type { ReactNode } from "react";
import { MessageSquare, CalendarDays } from "lucide-react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import type { StudentReflection } from "@/components/features/activities/types";
import { formatDateMedium } from "@/lib/formatTime";
import styles from "./StudentReflectionCard.module.scss";

export interface StudentReflectionCardProps {
  /** Supplied learner reflection to display (read-only). */
  reflection: StudentReflection | null;
  loading?: boolean;
  error?: string;
  /** Optional content rendered below the reflection. */
  children?: ReactNode;
  className?: string;
}

export function StudentReflectionCard({
  reflection,
  loading = false,
  error,
  children,
  className,
}: StudentReflectionCardProps) {
  if (loading) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <div className={styles.loadingState}>
          <Spinner size="md" label="Loading reflection" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <Alert
          variant="error"
          title="Unable to load reflection"
          description={error}
        />
      </Card>
    );
  }

  if (!reflection) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <EmptyState
          icon={<MessageSquare aria-hidden="true" />}
          title="No reflection"
          description="Learner reflections will appear here once submitted."
        />
      </Card>
    );
  }

  const dateStr = formatDateMedium(reflection.date);

  return (
    <Card className={clsx(styles.card, className)} padded>
      <Card.Header className={styles.header}>
        <div className={styles.learnerRow}>
          <Avatar
            src={reflection.learnerAvatarSrc}
            name={reflection.learnerName}
            size="md"
          />
          <div className={styles.learnerInfo}>
            <span className={styles.learnerName}>{reflection.learnerName}</span>
            {reflection.learnerRef && (
              <span className={styles.learnerRef}>{reflection.learnerRef}</span>
            )}
          </div>
        </div>

        <div className={styles.badgeRow}>
          {reflection.programmeLabel && (
            <Badge variant="info" size="sm">
              {reflection.programmeLabel}
            </Badge>
          )}
          {dateStr && (
            <Badge variant="neutral" size="sm" icon={<CalendarDays aria-hidden="true" size={12} />}>
              {dateStr}
            </Badge>
          )}
        </div>
      </Card.Header>

      <Card.Body className={styles.body}>
        {reflection.prompt && (
          <p className={styles.prompt}>{reflection.prompt}</p>
        )}
        <blockquote className={styles.reflectionText}>
          {reflection.reflection}
        </blockquote>

        {children}
      </Card.Body>
    </Card>
  );
}
