"use client";

import type { ReactNode } from "react";
import { History as HistoryIcon, ChevronDown } from "lucide-react";
import { useId, useState } from "react";
import clsx from "clsx";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatAbsolute, formatRelativeTime } from "@/lib/formatTime";
import styles from "./AuditTrail.module.scss";

export interface AuditTrailEvent {
  id: string;
  /** Epoch ms or ISO string. */
  timestamp: number | string;
  actor: ReactNode;
  action: ReactNode;
  /** Optional target/object of the action. */
  target?: ReactNode;
  /** Optional extra details shown in an expander. */
  details?: ReactNode;
  /** Optional originating IP address. */
  ipAddress?: string;
}

export interface AuditTrailProps {
  events: AuditTrailEvent[];
  scrollable?: boolean;
  /** Optional custom empty state. */
  emptyState?: ReactNode;
  /** Default empty state copy. */
  emptyTitle?: ReactNode;
  emptyDescription?: ReactNode;
  /** Mark the region as live so new events are announced politely. */
  ariaLive?: "polite" | "off";
  ariaLabel?: string;
  className?: string;
}

function actorToAvatarName(actor: ReactNode): string | undefined {
  if (typeof actor === "string" && actor.trim().length > 0) return actor.trim();
  return undefined;
}

function actorToString(actor: ReactNode): string {
  if (typeof actor === "string") return actor;
  if (typeof actor === "number") return String(actor);
  return "Actor";
}

function toDateTime(timestamp: number | string): string {
  return typeof timestamp === "string"
    ? timestamp
    : new Date(timestamp).toISOString();
}

export function AuditTrail({
  events,
  scrollable = true,
  emptyState,
  emptyTitle = "No audit events",
  emptyDescription = "Audit events will appear here as they are recorded.",
  ariaLive = "off",
  ariaLabel = "Audit trail",
  className,
}: AuditTrailProps) {
  if (events.length === 0) {
    return (
      <div
        className={clsx(styles.audit, className)}
        aria-live={ariaLive === "polite" ? "polite" : undefined}
      >
        {emptyState ?? (
          <EmptyState
            icon={<HistoryIcon aria-hidden="true" />}
            title={emptyTitle}
            description={emptyDescription}
            className={styles.empty}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={clsx(styles.audit, scrollable && styles.scrollable, className)}
      aria-live={ariaLive === "polite" ? "polite" : undefined}
    >
      <ol className={styles.list} aria-label={ariaLabel}>
        {events.map((event, index) => (
          <AuditRow
            key={event.id}
            event={event}
            isLast={index === events.length - 1}
          />
        ))}
      </ol>
    </div>
  );
}

interface AuditRowProps {
  event: AuditTrailEvent;
  isLast: boolean;
}

function AuditRow({ event, isLast }: AuditRowProps) {
  const generatedId = useId();
  const [open, setOpen] = useState(false);
  const hasDetails = Boolean(event.details || event.ipAddress);
  const panelId = `${generatedId}-panel`;
  const triggerId = `${generatedId}-trigger`;

  return (
    <li className={styles.item}>
      <span className={styles.rail} aria-hidden="true">
        <span className={styles.marker} />
        {!isLast && <span className={styles.line} />}
      </span>
      <div className={styles.body}>
        <div className={styles.head}>
          <Avatar
            name={actorToAvatarName(event.actor) ?? actorToString(event.actor)}
            alt={actorToString(event.actor)}
            size="sm"
          />
          <div className={styles.headText}>
            <span className={styles.headLine}>
              <span className={styles.actorInline}>{event.actor}</span>
              <span className={styles.actionLabel}>{event.action}</span>
            </span>
            {event.target && (
              <span className={styles.targetLine}>
                <span className={styles.preposition}>on</span>
                <span className={styles.target}>{event.target}</span>
              </span>
            )}
          </div>
          <time
            className={styles.time}
            dateTime={toDateTime(event.timestamp)}
            title={formatAbsolute(event.timestamp)}
          >
            {formatRelativeTime(event.timestamp)}
          </time>
        </div>

        {hasDetails && (
          <div className={styles.expanderRow}>
            <button
              id={triggerId}
              type="button"
              className={styles.expanderTrigger}
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpen((prev) => !prev)}
            >
              <span className={styles.expanderLabel}>
                {open ? "Hide details" : "Show details"}
              </span>
              <ChevronDown
                className={clsx(styles.chevron, open && styles.chevronOpen)}
                aria-hidden="true"
              />
            </button>
            {open && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={triggerId}
                className={styles.expanderPanel}
              >
                <dl className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <dt className={styles.detailLabel}>Timestamp</dt>
                    <dd className={styles.detailValue}>
                      <time
                        dateTime={toDateTime(event.timestamp)}
                        title={formatAbsolute(event.timestamp)}
                      >
                        {formatAbsolute(event.timestamp)}
                      </time>
                      <span className={styles.detailRelative}>
                        ({formatRelativeTime(event.timestamp)})
                      </span>
                    </dd>
                  </div>
                  {event.ipAddress && (
                    <div className={styles.detailItem}>
                      <dt className={styles.detailLabel}>IP address</dt>
                      <dd className={styles.detailValue}>{event.ipAddress}</dd>
                    </div>
                  )}
                  {event.details && (
                    <div className={styles.detailItem}>
                      <dt className={styles.detailLabel}>Details</dt>
                      <dd className={styles.detailValue}>{event.details}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
