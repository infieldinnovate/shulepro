"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ClipboardList } from "lucide-react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Accordion } from "@/components/ui/Accordion";
import type { InterventionTrackerEntry } from "@/components/features/inclusion/types";
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
  const openIndex = entries.findIndex((e) => e.id === expandedId);

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

  return (
    <Card className={clsx(styles.card, className)} padded={false}>
      <div aria-label="Intervention tracker entries">
        <Accordion
          className={styles.list}
          openIndices={openIndex >= 0 ? [openIndex] : []}
          onChange={(indices) => {
            setExpandedId(
              indices.length > 0 ? entries[indices[0]]?.id ?? null : null,
            );
          }}
          items={entries.map((entry) => ({
            id: entry.id,
            header: (
              <>
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
              </>
            ),
            panel: (
              <div className={styles.entryNotes}>
                <p className={styles.notesText}>{entry.notes}</p>
              </div>
            ),
            disabled: !Boolean(entry.notes),
          }))}
        />
      </div>
    </Card>
  );
}
