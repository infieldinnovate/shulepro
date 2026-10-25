import { Factory as History } from "lucide-react";
import clsx from "clsx";
import { ActivityTimeline } from "@/components/shared/ActivityTimeline";
import type {
  ActivityTimelineEvent,
  ActivityTimelineVariant,
} from "@/components/shared/ActivityTimeline";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import styles from "./LearnerTimeline.module.scss";

export type LearnerTimelineEventType =
  | "enrolment"
  | "transfer"
  | "grade-promotion"
  | "assessment-milestone"
  | "safeguarding-referral"
  | "attendance"
  | "wellbeing"
  | "inclusion"
  | "note"
  | "other";

const VARIANT_BY_TYPE: Record<LearnerTimelineEventType, ActivityTimelineVariant> = {
  enrolment: "success",
  transfer: "info",
  "grade-promotion": "success",
  "assessment-milestone": "info",
  "safeguarding-referral": "error",
  attendance: "warning",
  wellbeing: "warning",
  inclusion: "info",
  note: "neutral",
  other: "neutral",
};

export interface LearnerTimelineEvent extends ActivityTimelineEvent {
  /** Learner-specific event type. Maps to a sensible timeline variant by default. */
  eventType?: LearnerTimelineEventType;
  /** Override the auto-derived variant. */
  variant?: ActivityTimelineVariant;
}

export interface LearnerTimelineProps {
  events: LearnerTimelineEvent[];
  loading?: boolean;
  error?: string;
  /** Title shown in the empty state. */
  emptyTitle?: string;
  /** Description shown in the empty state. */
  emptyDescription?: string;
  /** Constrain height and scroll. */
  scrollable?: boolean;
  ariaLabel?: string;
  className?: string;
}

export function LearnerTimeline({
  events,
  loading = false,
  error,
  emptyTitle = "No activity recorded",
  emptyDescription = "This learner has no timeline events yet.",
  scrollable = true,
  ariaLabel = "Learner timeline",
  className,
}: LearnerTimelineProps) {
  if (loading) {
    return (
      <div className={clsx(styles.loading, className)}>
        <Spinner size="md" label="Loading timeline" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        variant="error"
        title="Unable to load timeline"
        description={error}
        className={className}
      />
    );
  }

  if (events.length === 0) {
    return (
      <EmptyState
        icon={<History aria-hidden="true" />}
        title={emptyTitle}
        description={emptyDescription}
        className={className}
      />
    );
  }

  const mapped: ActivityTimelineEvent[] = events.map((e) => ({
    ...e,
    variant: e.variant ?? (e.eventType ? VARIANT_BY_TYPE[e.eventType] : undefined),
  }));

  return (
    <ActivityTimeline
      events={mapped}
      scrollable={scrollable}
      ariaLabel={ariaLabel}
      className={clsx(styles.timeline, className)}
    />
  );
}
