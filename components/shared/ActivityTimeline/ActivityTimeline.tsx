import type { ReactNode } from "react";
import { WorkflowTimeline } from "../WorkflowTimeline";
import type {
  WorkflowTimelineEvent,
  WorkflowTimelineVariant,
  WorkflowTimelineActor,
} from "../WorkflowTimeline";

export type ActivityTimelineVariant = WorkflowTimelineVariant;
export type ActivityTimelineActor = WorkflowTimelineActor;

export interface ActivityTimelineEvent {
  id: string;
  /** Epoch ms or ISO string. */
  timestamp: number | string;
  title: ReactNode;
  description?: ReactNode;
  actor?: ActivityTimelineActor;
  variant?: ActivityTimelineVariant;
}

export interface ActivityTimelineProps {
  events: ActivityTimelineEvent[];
  emptyTitle?: ReactNode;
  emptyDescription?: ReactNode;
  /** Constrain height and scroll on narrow screens. */
  scrollable?: boolean;
  /** Optional accessible label for the list. */
  ariaLabel?: string;
  /** Mark the region as live so new events are announced politely. */
  ariaLive?: "polite" | "off";
  className?: string;
}

export function ActivityTimeline({
  events,
  emptyTitle,
  emptyDescription,
  scrollable = true,
  ariaLabel,
  ariaLive = "off",
  className,
}: ActivityTimelineProps) {
  // The WorkflowTimeline event shape is intentionally compatible; pass through.
  const timelineEvents: WorkflowTimelineEvent[] = events;

  return (
    <div
      className={className}
      aria-live={ariaLive === "polite" ? "polite" : undefined}
      aria-label={ariaLabel}
    >
      <WorkflowTimeline
        events={timelineEvents}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        scrollable={scrollable}
        ariaLabel={ariaLabel}
      />
    </div>
  );
}
