import type { ReactNode } from "react";
import { ClipboardList } from "lucide-react";
import clsx from "clsx";
import { Avatar } from "../../ui/Avatar";
import { EmptyState } from "../../ui/EmptyState";
import { formatAbsolute, formatRelativeTime } from "../../../lib/formatTime";
import styles from "./WorkflowTimeline.module.scss";

export type WorkflowTimelineVariant =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "error";

export interface WorkflowTimelineActor {
  name: string;
  avatarSrc?: string;
  initials?: string;
}

export interface WorkflowTimelineEvent {
  id: string;
  /** Epoch ms or ISO string. */
  timestamp: number | string;
  title: ReactNode;
  description?: ReactNode;
  actor?: WorkflowTimelineActor;
  variant?: WorkflowTimelineVariant;
}

export interface WorkflowTimelineProps {
  events: WorkflowTimelineEvent[];
  emptyTitle?: ReactNode;
  emptyDescription?: ReactNode;
  /** Constrain the timeline height and make it scrollable on narrow screens. */
  scrollable?: boolean;
  ariaLabel?: string;
  className?: string;
}

export function WorkflowTimeline({
  events,
  emptyTitle = "No activity yet",
  emptyDescription = "Events will appear here as they happen.",
  scrollable = false,
  ariaLabel = "Activity timeline",
  className,
}: WorkflowTimelineProps) {
  if (events.length === 0) {
    return (
      <div className={clsx(styles.timeline, className)}>
        <EmptyState
          icon={<ClipboardList aria-hidden="true" />}
          title={emptyTitle}
          description={emptyDescription}
          className={styles.empty}
        />
      </div>
    );
  }

  const list = (
    <ol className={styles.list} aria-label={ariaLabel}>
      {events.map((event, index) => {
        const isLast = index === events.length - 1;
        const variant = event.variant ?? "neutral";
        return (
          <li key={event.id} className={styles.item}>
            <span className={styles.rail} aria-hidden="true">
              <span className={clsx(styles.marker, styles[variant])} />
              {!isLast && <span className={styles.line} />}
            </span>
            <div className={styles.body}>
              <div className={styles.head}>
                {event.actor ? (
                  <span className={styles.actor}>
                    <Avatar
                      name={event.actor.initials ?? event.actor.name}
                      src={event.actor.avatarSrc}
                      alt={event.actor.name}
                      size="sm"
                    />
                    <span className={styles.actorName}>
                      {event.actor.name}
                    </span>
                  </span>
                ) : (
                  <span className={styles.title}>{event.title}</span>
                )}
                <time
                  className={styles.time}
                  dateTime={
                    typeof event.timestamp === "string"
                      ? event.timestamp
                      : new Date(event.timestamp).toISOString()
                  }
                  title={formatAbsolute(event.timestamp)}
                >
                  {formatRelativeTime(event.timestamp)}
                </time>
              </div>
              {event.actor && <p className={styles.title}>{event.title}</p>}
              {event.description && (
                <p className={styles.description}>{event.description}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );

  return (
    <div className={clsx(styles.timeline, className)}>
      {scrollable ? <div className={styles.scroll}>{list}</div> : list}
    </div>
  );
}
