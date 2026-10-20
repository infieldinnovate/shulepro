import { ClipboardList } from "lucide-react";
import clsx from "clsx";
import { Card } from "../../../ui/Card";
import { Spinner } from "../../../ui/Spinner";
import { Alert } from "../../../ui/Alert";
import { EmptyState } from "../../../ui/EmptyState";
import { StatusBadge } from "../../../shared/StatusBadge";
import { ActivityTimeline } from "../../../shared/ActivityTimeline";
import type {
  ActivityTimelineEvent,
  ActivityTimelineVariant,
} from "../../../shared/ActivityTimeline";
import type { WorkflowTimelineVariant } from "../../../shared/WorkflowTimeline";
import type { StatusBadgeMap } from "../../../shared/StatusBadge";
import type { ReferralStatusEvent, ReferralStatus } from "../types";
import styles from "./ReferralStatusTimeline.module.scss";

export type ReferralStatusBadgeMap = StatusBadgeMap<ReferralStatus>;

export type ReferralTimelineVariantMap = Record<
  ReferralStatus,
  WorkflowTimelineVariant
>;

export const DEFAULT_REFERRAL_STATUS_MAP: ReferralStatusBadgeMap = {
  draft: { variant: "neutral", label: "Draft", dot: true },
  submitted: { variant: "info", label: "Submitted", dot: true },
  acknowledged: { variant: "primary", label: "Acknowledged", dot: true },
  "in-progress": { variant: "info", label: "In progress", dot: true },
  completed: { variant: "success", label: "Completed", dot: true },
  declined: { variant: "error", label: "Declined", dot: true },
};

export const DEFAULT_REFERRAL_TIMELINE_VARIANT_MAP: ReferralTimelineVariantMap = {
  draft: "neutral",
  submitted: "info",
  acknowledged: "success",
  "in-progress": "info",
  completed: "success",
  declined: "error",
};

export interface ReferralStatusTimelineProps {
  events: ReferralStatusEvent[];
  statusMap?: ReferralStatusBadgeMap;
  variantMap?: ReferralTimelineVariantMap;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  scrollable?: boolean;
  className?: string;
}

function toTimelineEvents(
  events: ReferralStatusEvent[],
  variantMap: ReferralTimelineVariantMap,
): ActivityTimelineEvent[] {
  return events.map((event) => ({
    id: event.id,
    timestamp:
      typeof event.occurredAt === "string"
        ? event.occurredAt
        : event.occurredAt.toISOString(),
    title: event.label,
    description: event.description,
    actor: event.actorName ? { name: event.actorName } : undefined,
    variant: (variantMap[event.status] ?? "neutral") as ActivityTimelineVariant,
  }));
}

export function ReferralStatusTimeline({
  events,
  statusMap = DEFAULT_REFERRAL_STATUS_MAP,
  variantMap = DEFAULT_REFERRAL_TIMELINE_VARIANT_MAP,
  loading = false,
  error,
  empty = false,
  scrollable = true,
  className,
}: ReferralStatusTimelineProps) {
  if (loading) {
    return (
      <Card className={clsx(styles.card, styles.loadingCard, className)} padded>
        <div className={styles.loadingBody}>
          <Spinner size="md" label="Loading referral status" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <Alert
          variant="error"
          title="Unable to load referral status"
          description={error}
        />
      </Card>
    );
  }

  const isEmpty = empty || events.length === 0;

  if (isEmpty) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <EmptyState
          icon={<ClipboardList aria-hidden="true" />}
          title="No status updates"
          description="Status updates will appear here as the referral progresses."
        />
      </Card>
    );
  }

  const timelineEvents = toTimelineEvents(events, variantMap);
  const latestStatus = events[0]?.status;

  return (
    <Card className={clsx(styles.card, className)} padded>
      {latestStatus && (
        <Card.Header className={styles.header}>
          <div className={styles.headerRow}>
            <span className={styles.headerLabel}>Current status:</span>
            <StatusBadge
              status={latestStatus}
              statusMap={statusMap}
              size="sm"
            />
          </div>
        </Card.Header>
      )}
      <Card.Body className={styles.body}>
        <ActivityTimeline
          events={timelineEvents}
          scrollable={scrollable}
          ariaLabel="Referral status timeline"
        />
      </Card.Body>
    </Card>
  );
}
