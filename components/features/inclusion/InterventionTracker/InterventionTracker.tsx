"use client";

import { useState } from "react";
import type { KeyboardEvent } from "react";
import { format } from "date-fns";
import { ClipboardList, ChevronDown } from "lucide-react";
import clsx from "clsx";
import { Card } from "../../../ui/Card";
import { Badge } from "../../../ui/Badge";
import { Spinner } from "../../../ui/Spinner";
import { Alert } from "../../../ui/Alert";
import { EmptyState } from "../../../ui/EmptyState";
import type { InterventionTrackerEntry } from "../types";
import styles from "./InterventionTracker.module.scss";

export interface InterventionTrackerProps {
  entries: InterventionTrackerEntry[];
  loading?: boolean;
  error?: string;
  empty?: boolean;
  className?: string;
}

function toDate(d: Date | string): Date {
  return typeof d === "string" ? new Date(d) : d;
}

export function InterventionTracker({
  entries,
  loading = false,
  error,
  empty = false,
  className,
}: InterventionTrackerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) {
    return (
      <Card className={clsx(styles.card, styles.loadingCard, className)} padded>
        <div className={styles.loadingBody}>
          <Spinner size="md" label="Loading tracker entries" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <Alert
          variant="error"
          title="Unable to load tracker entries"
          description={error}
        />
      </Card>
    );
  }

  const isEmpty = empty || entries.length === 0;

  if (isEmpty) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <EmptyState
          icon={<ClipboardList aria-hidden="true" />}
          title="No tracker entries"
          description="Session and observation entries will appear here as they are recorded."
        />
      </Card>
    );
  }

  const toggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, id: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggle(id);
    }
  };

  return (
    <Card className={clsx(styles.card, className)} padded={false}>
      <ol className={styles.list} aria-label="Intervention tracker entries">
        {entries.map((entry, index) => {
          const isExpanded = expandedId === entry.id;
          const isLast = index === entries.length - 1;
          const hasNotes = Boolean(entry.notes);

          return (
            <li
              key={entry.id}
              className={clsx(styles.entry, !isLast && styles.entryBordered)}
            >
              <div className={styles.rail} aria-hidden="true">
                <span className={styles.marker} />
                {!isLast && <span className={styles.line} />}
              </div>

              <div className={styles.entryBody}>
                <button
                  type="button"
                  className={styles.entryHeader}
                  aria-expanded={isExpanded}
                  aria-controls={`${entry.id}-content`}
                  onClick={() => hasNotes && toggle(entry.id)}
                  onKeyDown={(e) => hasNotes && handleKeyDown(e, entry.id)}
                  disabled={!hasNotes}
                >
                  <span className={styles.entryDate}>
                    {format(toDate(entry.recordedAt), "EEE, MMM d, yyyy")}
                  </span>
                  {entry.outcomeLabel && (
                    <Badge variant="neutral" size="sm">
                      {entry.outcomeLabel}
                    </Badge>
                  )}
                  {entry.recordedByName && (
                    <span className={styles.entryActor}>
                      {entry.recordedByName}
                    </span>
                  )}
                  {hasNotes && (
                    <ChevronDown
                      aria-hidden="true"
                      className={clsx(
                        styles.chevron,
                        isExpanded && styles.chevronOpen,
                      )}
                    />
                  )}
                </button>

                {isExpanded && hasNotes && (
                  <div
                    id={`${entry.id}-content`}
                    className={styles.entryNotes}
                  >
                    <p className={styles.notesText}>{entry.notes}</p>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
