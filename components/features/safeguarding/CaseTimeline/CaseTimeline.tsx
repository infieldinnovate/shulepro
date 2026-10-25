import { ClipboardList } from "lucide-react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { ActivityTimeline } from "@/components/shared/ActivityTimeline";
import type {
  ActivityTimelineEvent,
  ActivityTimelineVariant,
} from "@/components/shared/ActivityTimeline";
import type { WorkflowTimelineVariant } from "@/components/shared/WorkflowTimeline";
import type { CaseTimelineEvent as InclusionCaseTimelineEvent } from "@/components/features/safeguarding/types";
import styles from "./CaseTimeline.module.scss";

export type CaseTimelineVariantMap = Record<
  InclusionCaseTimelineEvent["type"],
  WorkflowTimelineVariant
>;

export interface CaseTimelineProps {
  events: InclusionCaseTimelineEvent[];
  variantMap?: CaseTimelineVariantMap;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  scrollable?: boolean;
  ariaLive?: "polite" | "off";
  className?: string;
}

function toTimelineEvents(
  events: InclusionCaseTimelineEvent[],
  variantMap?: CaseTimelineVariantMap,
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
    variant: variantMap
      ? (variantMap[event.type] ?? "neutral") as ActivityTimelineVariant
      : undefined,
  }));
}

export function CaseTimeline({
  events,
  variantMap,
  loading = false,
  error,
  empty = false,
  scrollable = true,
  ariaLive = "off",
  className,
}: CaseTimelineProps) {
  if (loading) {
    return (
      <Card className={clsx(styles.card, styles.loadingCard, className)} padded>
        <div className={styles.loadingBody}>
          <Spinner size="md" label="Loading case timeline" />
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
          description="Events will appear here as the case is updated."
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
          ariaLabel="Case timeline"
        />
      </Card.Body>
    </Card>
  );
}
