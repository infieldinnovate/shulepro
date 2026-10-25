import type { ReactNode } from "react";
import { format } from "date-fns";
import { Accessibility } from "lucide-react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import type { AssistiveDevice } from "@/components/features/inclusion/types";
import styles from "./AssistiveDeviceCard.module.scss";

export interface AssistiveDeviceCardProps {
  device: AssistiveDevice | null;
  /** Optional status badge node rendered by the caller. */
  statusBadge?: ReactNode;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  disabled?: boolean;
  className?: string;
}

function toDate(d: Date | string): Date {
  return typeof d === "string" ? new Date(d) : d;
}

export function AssistiveDeviceCard({
  device,
  statusBadge,
  loading = false,
  error,
  empty = false,
  disabled = false,
  className,
}: AssistiveDeviceCardProps) {
  if (loading) {
    return (
      <Card className={clsx(styles.card, styles.loadingCard, className)} padded>
        <div className={styles.loadingBody}>
          <Spinner size="md" label="Loading assistive device" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <Alert
          variant="error"
          title="Unable to load device information"
          description={error}
        />
      </Card>
    );
  }

  if (empty || !device) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <EmptyState
          icon={<Accessibility aria-hidden="true" />}
          title="No device assigned"
          description="There is no assistive device to display yet."
        />
      </Card>
    );
  }

  return (
    <Card
      className={clsx(styles.card, disabled && styles.disabled, className)}
      padded
    >
      <Card.Header className={styles.header}>
        <div className={styles.titleRow}>
          <div className={styles.titleGroup}>
            <Accessibility aria-hidden="true" className={styles.titleIcon} />
            <h4 className={styles.title}>{device.name}</h4>
          </div>
          {statusBadge}
        </div>
        {device.category && (
          <Badge variant="neutral" size="sm">
            {device.category}
          </Badge>
        )}
      </Card.Header>

      <Card.Body className={styles.body}>
        <dl className={styles.metaGrid}>
          {device.assignedToName && (
            <div className={styles.metaItem}>
              <dt className={styles.metaLabel}>Assigned to</dt>
              <dd className={styles.metaValue}>{device.assignedToName}</dd>
            </div>
          )}
          {device.issuedDate && (
            <div className={styles.metaItem}>
              <dt className={styles.metaLabel}>Issued</dt>
              <dd className={styles.metaValue}>
                {format(toDate(device.issuedDate), "MMM d, yyyy")}
              </dd>
            </div>
          )}
        </dl>

        {device.notes && (
          <p className={styles.notes}>{device.notes}</p>
        )}
      </Card.Body>
    </Card>
  );
}
