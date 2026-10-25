import type { ReactNode } from "react";
import clsx from "clsx";
import { KpiGrid } from "@/components/shared/KpiGrid";
import { KpiCard } from "@/components/shared/KpiCard";
import type { KpiCardStatus } from "@/components/shared/KpiCard";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { Info } from "lucide-react";
import type { LearnerQuickStat } from "@/components/features/learners/types";
import styles from "./LearnerQuickView.module.scss";

export interface LearnerQuickViewProps {
  stats: LearnerQuickStat[];
  loading?: boolean;
  error?: string;
  empty?: boolean;
  disabled?: boolean;
  /** Accessible label for the grid region. */
  label?: string;
  /** Optional header rendered above the stats grid. */
  header?: ReactNode;
  className?: string;
}

export function LearnerQuickView({
  stats,
  loading = false,
  error,
  empty = false,
  disabled = false,
  label = "Learner quick stats",
  header,
  className,
}: LearnerQuickViewProps) {
  if (loading) {
    return (
      <Card padded className={clsx(styles.loading, className)}>
        <Spinner size="md" label="Loading quick stats" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card padded className={className}>
        <Alert variant="error" title="Stats unavailable" description={error} />
      </Card>
    );
  }

  if (empty || stats.length === 0) {
    return (
      <Card padded className={clsx(styles.empty, className)}>
        <EmptyState
          icon={<Info aria-hidden="true" />}
          title="No stats available"
          description="There is no summary data for this learner yet."
        />
      </Card>
    );
  }

  return (
    <div className={clsx(styles.wrapper, disabled && styles.disabled, className)}>
      {header && <div className={styles.header}>{header}</div>}
      <KpiGrid label={label} columns={{ sm: 1, md: 2, lg: 3 }}>
        {stats.map((stat) => (
          <KpiCard
            key={stat.id}
            title={stat.label}
            value={stat.value}
            unit={stat.unit}
            status={stat.status as KpiCardStatus}
            trend={stat.trend}
            target={stat.target}
            description={stat.description}
            icon={stat.icon}
            definition={stat.definition}
            onSelect={disabled ? undefined : stat.onSelect}
          />
        ))}
      </KpiGrid>
    </div>
  );
}
