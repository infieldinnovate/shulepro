import { ClipboardList } from "lucide-react";
import clsx from "clsx";
import { Card } from "../../../ui/Card";
import { Spinner } from "../../../ui/Spinner";
import { Alert } from "../../../ui/Alert";
import { EmptyState } from "../../../ui/EmptyState";
import { ActivityTimeline } from "../../../shared/ActivityTimeline";
import type {
  ActivityTimelineEvent,
  ActivityTimelineVariant,
} from "../../../shared/ActivityTimeline";
import type { WorkflowTimelineVariant } from "../../../shared/WorkflowTimeline";
import type { SupportPlanTimelineEvent as InclusionTimelineEvent } from "../types";
import styles from "./SupportPlanTimeline.module.scss";

export type SupportPlanTimelineVariantMap = Record<
  InclusionTimelineEvent["type"],
  WorkflowTimelineVariant
>;

export const DEFAULT_TIMELINE_VARIANT_MAP: SupportPlanTimelineVariantMap = {
  created: "info",
  updated: "neutral",
  "goal-added": "info",
  "goal-updated": "neutral",
  "goal-achieved": "success",
  "review-scheduled": "info",
  "review-completed": "success",
  "accommodation-added": "info",
  "accommodation-updated": "neutral",
  "accommodation-withdrawn": "warning",
  "device-issued": "info",
  "device-returned": "neutral",
  "referral-made": "warning",
  "note-added": "neutral",
};

export interface SupportPlanTimelineProps {
  events: InclusionTimelineEvent[];
  variantMap?: SupportPlanTimelineVariantMap;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  scrollable?: boolean;
  /** Mark the region as live so new events are announced politely. */
  ariaLive?: "polite" | "off";
  className?: string;
}

function toTimelineEvents(
  events: InclusionTimelineEvent[],
  variantMap: SupportPlanTimelineVariantMap,
): ActivityTimelineEvent[] {
  return events.map((event) => ({
    id: event.id,
    timestamp:
      typeof event.occurredAt === "string"
        ? event.occurredAt
        : event.occurredAt.toISOString(),
    title: event.label,
    description: event.description,
    actor: event.actorName
      ? { name: event.actorName }
      : undefined,
    variant: (variantMap[event.type] ?? "neutral") as ActivityTimelineVariant,
  }));
}

export function SupportPlanTimeline({
  events,
  variantMap = DEFAULT_TIMELINE_VARIANT_MAP,
  loading = false,
  error,
  empty = false,
  scrollable = true,
  ariaLive = "off",
  className,
}: SupportPlanTimelineProps) {
  if (loading) {
    return (
      <Card className={clsx(styles.card, styles.loadingCard, className)} padded>
        <div className={styles.loadingBody}>
          <Spinner size="md" label="Loading timeline" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <Alert
          variant="error"
          title="Unable to load timeline"
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
          title="No timeline events"
          description="Events will appear here as the support plan is updated."
        />
      </Card>
    );
  }

  const timelineEvents = toTimelineEvents(events, variantMap);

  return (
    <Card className={clsx(styles.card, className)} padded>
      <Card.Body className={styles.body}>
        <ActivityTimeline
          events={timelineEvents}
          scrollable={scrollable}
          ariaLive={ariaLive}
          ariaLabel="Support plan timeline"
        />
      </Card.Body>
    </Card>
  );
}
