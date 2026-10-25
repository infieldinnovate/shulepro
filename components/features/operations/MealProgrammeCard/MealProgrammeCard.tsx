import type { ReactNode } from "react";
import { format } from "date-fns";
import { UtensilsCrossed } from "lucide-react";
import clsx from "clsx";
import { RecordSummaryCard } from "@/components/shared/RecordSummaryCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { StatusBadgeMap } from "@/components/shared/StatusBadge";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
import type { MealProgramme, MealProgrammeStatus } from "@/components/features/operations/types";
import styles from "./MealProgrammeCard.module.scss";

export type MealProgrammeStatusBadgeMap = StatusBadgeMap<MealProgrammeStatus>;

export interface MealProgrammeCardProps {
  programme?: MealProgramme | null;
  statusBadgeMap: MealProgrammeStatusBadgeMap;
  actions?: ReactNode;
  onView?: () => void;
  ariaLabel?: string;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  className?: string;
}

function toDate(d: Date | string): Date {
  return typeof d === "string" ? new Date(d) : d;
}

export function MealProgrammeCard({
  programme,
  statusBadgeMap,
  actions,
  onView,
  ariaLabel,
  loading = false,
  error,
  empty = false,
  className,
}: MealProgrammeCardProps) {
  if (loading) {
    return (
      <Card padded className={clsx(styles.loadingCard, className)}>
        <Spinner size="md" label="Loading meal programme" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card padded className={className}>
        <Alert variant="error" title="Unable to load programme" description={error} />
      </Card>
    );
  }

  if (empty || !programme) {
    return (
      <Card padded className={clsx(styles.emptyCard, className)}>
        <EmptyState
          icon={<UtensilsCrossed aria-hidden="true" />}
          title="No meal programme"
          description="There is no meal programme entry to display."
        />
      </Card>
    );
  }

  const meta: ReactNode[] = [
    <span key="mealType" className={styles.metaEntry}>
      <span className={styles.metaLabel}>Meal type</span>
      <span className={styles.metaValue}>{programme.mealType}</span>
    </span>,
    <span key="date" className={styles.metaEntry}>
      <span className={styles.metaLabel}>Date</span>
      <span className={styles.metaValue}>
        {format(toDate(programme.date), "MMM d, yyyy")}
      </span>
    </span>,
    <span key="served" className={styles.metaEntry}>
      <span className={styles.metaLabel}>Served</span>
      <span className={styles.metaValue}>{programme.servedCount}</span>
    </span>,
    <span key="eligible" className={styles.metaEntry}>
      <span className={styles.metaLabel}>Eligible</span>
      <span className={styles.metaValue}>{programme.eligibleCount}</span>
    </span>,
  ];

  if (programme.provider) {
    meta.push(
      <span key="provider" className={styles.metaEntry}>
        <span className={styles.metaLabel}>Provider</span>
        <span className={styles.metaValue}>{programme.provider}</span>
      </span>,
    );
  }

  return (
    <RecordSummaryCard
      avatar={
        <span className={styles.iconWrap}>
          <UtensilsCrossed aria-hidden="true" />
        </span>
      }
      title={programme.name}
      subtitle={`${programme.servedCount} / ${programme.eligibleCount} served`}
      meta={meta}
      status={
        programme.status ? (
          <StatusBadge
            status={programme.status}
            statusMap={statusBadgeMap}
            size="sm"
          />
        ) : undefined
      }
      actions={actions}
      onClick={onView}
      ariaLabel={ariaLabel ?? `View ${programme.name}`}
      className={className}
    />
  );
}
