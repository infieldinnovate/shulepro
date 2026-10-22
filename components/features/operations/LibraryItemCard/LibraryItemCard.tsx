import type { ReactNode } from "react";
import { BookOpen } from "lucide-react";
import clsx from "clsx";
import { RecordSummaryCard } from "../../../shared/RecordSummaryCard";
import { StatusBadge } from "../../../shared/StatusBadge";
import type { StatusBadgeMap } from "../../../shared/StatusBadge";
import { Spinner } from "../../../ui/Spinner";
import { EmptyState } from "../../../ui/EmptyState";
import { Alert } from "../../../ui/Alert";
import { Card } from "../../../ui/Card";
import type { LibraryItem, LibraryAvailabilityStatus } from "../types";
import styles from "./LibraryItemCard.module.scss";

export type LibraryAvailabilityBadgeMap = StatusBadgeMap<LibraryAvailabilityStatus>;

export interface LibraryItemCardProps {
  item?: LibraryItem | null;
  statusBadgeMap: LibraryAvailabilityBadgeMap;
  actions?: ReactNode;
  onAction?: () => void;
  ariaLabel?: string;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  className?: string;
}

export function LibraryItemCard({
  item,
  statusBadgeMap,
  actions,
  onAction,
  ariaLabel,
  loading = false,
  error,
  empty = false,
  className,
}: LibraryItemCardProps) {
  if (loading) {
    return (
      <Card padded className={clsx(styles.loadingCard, className)}>
        <Spinner size="md" label="Loading library item" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card padded className={className}>
        <Alert variant="error" title="Unable to load item" description={error} />
      </Card>
    );
  }

  if (empty || !item) {
    return (
      <Card padded className={clsx(styles.emptyCard, className)}>
        <EmptyState
          icon={<BookOpen aria-hidden="true" />}
          title="No library item"
          description="There is no library item to display."
        />
      </Card>
    );
  }

  const meta: ReactNode[] = [
    <span key="category" className={styles.metaEntry}>
      <span className={styles.metaLabel}>Category</span>
      <span className={styles.metaValue}>{item.category}</span>
    </span>,
    <span key="copies" className={styles.metaEntry}>
      <span className={styles.metaLabel}>Copies</span>
      <span className={styles.metaValue}>
        {item.availableCopies} of {item.totalCopies} available
      </span>
    </span>,
  ];

  if (item.author) {
    meta.push(
      <span key="author" className={styles.metaEntry}>
        <span className={styles.metaLabel}>Author</span>
        <span className={styles.metaValue}>{item.author}</span>
      </span>,
    );
  }

  if (item.isbn) {
    meta.push(
      <span key="isbn" className={styles.metaEntry}>
        <span className={styles.metaLabel}>ISBN</span>
        <span className={styles.metaValue}>{item.isbn}</span>
      </span>,
    );
  }

  if (item.shelfLocation) {
    meta.push(
      <span key="shelf" className={styles.metaEntry}>
        <span className={styles.metaLabel}>Shelf</span>
        <span className={styles.metaValue}>{item.shelfLocation}</span>
      </span>,
    );
  }

  return (
    <RecordSummaryCard
      avatar={
        <span className={styles.iconWrap}>
          <BookOpen aria-hidden="true" />
        </span>
      }
      title={item.title}
      subtitle={item.author ?? undefined}
      meta={meta}
      status={
        item.status ? (
          <StatusBadge
            status={item.status}
            statusMap={statusBadgeMap}
            size="sm"
          />
        ) : undefined
      }
      actions={actions}
      onClick={onAction}
      ariaLabel={ariaLabel ?? `View ${item.title}`}
      className={className}
    />
  );
}
