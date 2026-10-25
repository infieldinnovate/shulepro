"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { ChevronRight, ListChecks } from "lucide-react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Accommodation } from "@/components/features/inclusion/types";
import { formatDateMedium } from "@/lib/formatTime";
import styles from "./AccommodationList.module.scss";

export interface AccommodationListProps {
  accommodations: Accommodation[];
  /** Optional status badge node per accommodation (caller provides badges). */
  renderStatusBadge?: (status: Accommodation["status"]) => ReactNode;
  /** When provided, clicking a row calls this handler. */
  onSelect?: (accommodation: Accommodation) => void;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  disabled?: boolean;
  className?: string;
}

export function AccommodationList({
  accommodations,
  renderStatusBadge,
  onSelect,
  loading = false,
  error,
  empty = false,
  disabled = false,
  className,
}: AccommodationListProps) {
  if (loading) {
    return (
      <Card className={clsx(styles.card, styles.loadingCard, className)} padded>
        <div className={styles.loadingBody}>
          <Spinner size="md" label="Loading accommodations" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <Alert
          variant="error"
          title="Unable to load accommodations"
          description={error}
        />
      </Card>
    );
  }

  const isEmpty = empty || accommodations.length === 0;

  if (isEmpty) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <EmptyState
          icon={<ListChecks aria-hidden="true" />}
          title="No accommodations"
          description="There are no accommodations to display yet."
        />
      </Card>
    );
  }

  return (
    <Card
      className={clsx(styles.card, disabled && styles.disabled, className)}
      padded={false}
    >
      <ul className={styles.list} aria-label="Accommodations">
        {accommodations.map((item) => {
          const clickable = typeof onSelect === "function" && !disabled;

          const handleKeyDown = (event: KeyboardEvent<HTMLLIElement>) => {
            if (!clickable) return;
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onSelect?.(item);
            }
          };

          return (
            <li
              key={item.id}
              className={clsx(styles.row, clickable && styles.rowClickable)}
              role={clickable ? "button" : undefined}
              tabIndex={clickable ? 0 : undefined}
              aria-label={
                clickable ? `View accommodation: ${item.category}` : undefined
              }
              onClick={clickable ? () => onSelect?.(item) : undefined}
              onKeyDown={handleKeyDown}
            >
              <div className={styles.rowMain}>
                <div className={styles.rowHeader}>
                  <span className={styles.category}>{item.category}</span>
                  {renderStatusBadge?.(item.status)}
                </div>
                <p className={styles.description}>{item.description}</p>
                <div className={styles.metaRow}>
                  {item.providerName && (
                    <span className={styles.metaItem}>
                      Provider: {item.providerName}
                    </span>
                  )}
                  {item.startDate && (
                    <span className={styles.metaItem}>
                      From {formatDateMedium(item.startDate)}
                    </span>
                  )}
                  {item.endDate && (
                    <span className={styles.metaItem}>
                      Until {formatDateMedium(item.endDate)}
                    </span>
                  )}
                </div>
                {item.notes && (
                  <p className={styles.notes}>{item.notes}</p>
                )}
              </div>
              {clickable && (
                <ChevronRight
                  aria-hidden="true"
                  className={styles.chevron}
                />
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
