import type { ReactNode } from "react";
import { format } from "date-fns";
import { Package } from "lucide-react";
import clsx from "clsx";
import { RecordSummaryCard } from "@/components/shared/RecordSummaryCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { StatusBadgeMap } from "@/components/shared/StatusBadge";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
import type {
  InventoryItem,
  InventoryItemCondition,
  InventoryItemStatus,
} from "@/components/features/operations/types";
import styles from "./InventoryItemCard.module.scss";

export type ConditionBadgeMap = StatusBadgeMap<InventoryItemCondition>;
export type ItemStatusBadgeMap = StatusBadgeMap<InventoryItemStatus>;

export interface InventoryItemCardProps {
  item?: InventoryItem | null;
  conditionBadgeMap: ConditionBadgeMap;
  statusBadgeMap: ItemStatusBadgeMap;
  /** Optional action buttons rendered inline-end. */
  actions?: ReactNode;
  /** Make the card clickable. */
  onClick?: () => void;
  ariaLabel?: string;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  className?: string;
}

function toDate(d: Date | string): Date {
  return typeof d === "string" ? new Date(d) : d;
}

export function InventoryItemCard({
  item,
  conditionBadgeMap,
  statusBadgeMap,
  actions,
  onClick,
  ariaLabel,
  loading = false,
  error,
  empty = false,
  className,
}: InventoryItemCardProps) {
  if (loading) {
    return (
      <Card padded className={clsx(styles.loadingCard, className)}>
        <Spinner size="md" label="Loading inventory item" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card padded className={className}>
        <Alert
          variant="error"
          title="Unable to load item"
          description={error}
        />
      </Card>
    );
  }

  if (empty || !item) {
    return (
      <Card padded className={clsx(styles.emptyCard, className)}>
        <EmptyState
          icon={<Package aria-hidden="true" />}
          title="No item"
          description="There is no inventory item to display."
        />
      </Card>
    );
  }

  const meta: ReactNode[] = [
    <span key="code" className={styles.metaEntry}>
      <span className={styles.metaLabel}>Code</span>
      <span className={styles.metaValue}>{item.code}</span>
    </span>,
    <span key="category" className={styles.metaEntry}>
      <span className={styles.metaLabel}>Category</span>
      <span className={styles.metaValue}>{item.category}</span>
    </span>,
    <span key="quantity" className={styles.metaEntry}>
      <span className={styles.metaLabel}>Quantity</span>
      <span className={styles.metaValue}>
        {item.quantity} {item.unit}
      </span>
    </span>,
  ];

  if (item.location) {
    meta.push(
      <span key="location" className={styles.metaEntry}>
        <span className={styles.metaLabel}>Location</span>
        <span className={styles.metaValue}>{item.location}</span>
      </span>,
    );
  }

  if (item.lastUpdated) {
    meta.push(
      <span key="lastUpdated" className={styles.metaEntry}>
        <span className={styles.metaLabel}>Last updated</span>
        <span className={styles.metaValue}>
          {format(toDate(item.lastUpdated), "MMM d, yyyy")}
        </span>
      </span>,
    );
  }

  return (
    <RecordSummaryCard
      avatar={
        <span className={styles.iconWrap}>
          <Package aria-hidden="true" />
        </span>
      }
      title={item.name}
      subtitle={item.code}
      meta={meta}
      status={
        <span className={styles.badgeRow}>
          <StatusBadge
            status={item.condition}
            statusMap={conditionBadgeMap}
            size="sm"
          />
          <StatusBadge
            status={item.status}
            statusMap={statusBadgeMap}
            size="sm"
          />
        </span>
      }
      actions={actions}
      onClick={onClick}
      ariaLabel={ariaLabel ?? `View ${item.name}`}
      className={className}
    />
  );
}
