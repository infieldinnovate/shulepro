import type { ReactNode } from "react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Megaphone, Users, Clock, X } from "lucide-react";
import type { Announcement, DisabledState } from "@/components/features/engagement/models";
import styles from "./AnnouncementCard.module.scss";

export interface AnnouncementCardProps {
  /** Announcement data — supplied via props. */
  announcement?: Announcement | null;
  /** Optional priority badge slot — overrides the default. */
  priority?: ReactNode;
  /** Optional action slot (e.g. edit). */
  actions?: ReactNode;
  /** Loading state. */
  loading?: boolean;
  /** Empty state. */
  empty?: boolean;
  /** Disabled state. */
  disabled?: DisabledState;
  className?: string;
}

function formatDateLabel(value?: Date | string): string | null {
  if (!value) return null;
  const date = typeof value === "string" ? new Date(value) : value;
  if (date instanceof Date && !Number.isNaN(date.getTime())) {
    return date.toLocaleDateString();
  }
  if (typeof value === "string") return value;
  return null;
}

export function AnnouncementCard({
  announcement,
  priority,
  actions,
  loading = false,
  empty = false,
  disabled,
  className,
}: AnnouncementCardProps) {
  if (loading) {
    return (
      <Card padded className={clsx(styles.loading, className)}>
        <Spinner size="md" label="Loading announcement" />
      </Card>
    );
  }

  if (empty || !announcement) {
    return (
      <Card padded className={clsx(styles.empty, className)}>
        <EmptyState
          icon={<Megaphone aria-hidden="true" />}
          title="No announcement"
          description="No announcement to display."
        />
      </Card>
    );
  }

  const isDisabled = Boolean(disabled?.disabled);
  const publishedLabel = formatDateLabel(announcement.publishedAt);
  const expiryLabel = formatDateLabel(announcement.expiresAt);
  const isExpired =
    expiryLabel != null &&
    new Date(announcement.expiresAt as string).getTime() < Date.now();

  return (
    <Card
      padded={false}
      className={clsx(
        styles.card,
        isDisabled && styles.disabled,
        isExpired && styles.expired,
        className,
      )}
      aria-disabled={isDisabled || undefined}
    >
      <div className={styles.body}>
        <div className={styles.header}>
          <span className={styles.icon}>
            <Megaphone aria-hidden="true" />
          </span>
          <div className={styles.headerInfo}>
            <h3 className={styles.title}>{announcement.title}</h3>
            {announcement.audience && (
              <div className={styles.audience}>
                <Users aria-hidden="true" />
                <span>{announcement.audience}</span>
              </div>
            )}
          </div>
          <div className={styles.badges}>
            {priority ?? (announcement.priority && (
              <Badge variant="warning" size="sm">
                {announcement.priority}
              </Badge>
            ))}
            {isExpired && (
              <Badge variant="neutral" size="sm">
                Expired
              </Badge>
            )}
          </div>
        </div>

        <p className={styles.bodyText}>{announcement.body}</p>

        <div className={styles.meta}>
          {announcement.publishedByName && (
            <span className={styles.metaItem}>
              <span className={styles.metaLabel}>By</span>
              <span className={styles.metaValue}>
                {announcement.publishedByName}
              </span>
            </span>
          )}
          {publishedLabel && (
            <span className={styles.metaItem}>
              <Clock aria-hidden="true" />
              <span>{publishedLabel}</span>
            </span>
          )}
          {expiryLabel && !isExpired && (
            <span className={styles.metaItem}>
              <X aria-hidden="true" />
              <span>Expires {expiryLabel}</span>
            </span>
          )}
        </div>

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
