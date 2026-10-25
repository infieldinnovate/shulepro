import type { ReactNode } from "react";
import { TrendingUp } from "lucide-react";
import clsx from "clsx";
import { TargetProgressCard } from "@/components/shared/TargetProgressCard";
import { KpiCard } from "@/components/shared/KpiCard";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { computeTargetProgress } from "@/lib/analytics";
import type { CampaignTarget, CampaignParticipantSummary } from "@/components/features/activities/types";
import styles from "./CampaignProgressTracker.module.scss";

export interface CampaignProgressTrackerProps {
  /** Configurable targets to track progress against. */
  targets: CampaignTarget[];
  /** Optional participant summary for KPI display. */
  participants?: CampaignParticipantSummary | null;
  /** Optional title for the tracker. */
  title?: string;
  loading?: boolean;
  error?: string;
  /** Optional content rendered below the tracker. */
  children?: ReactNode;
  className?: string;
}

function formatNumber(n: number): string {
  return n.toLocaleString();
}

export function CampaignProgressTracker({
  targets,
  participants,
  title = "Campaign progress",
  loading = false,
  error,
  children,
  className,
}: CampaignProgressTrackerProps) {
  if (loading) {
    return (
      <div className={clsx(styles.container, className)}>
        <div className={styles.loadingState}>
          <Spinner size="md" label="Loading campaign progress" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={clsx(styles.container, className)}>
        <Alert
          variant="error"
          title="Unable to load campaign progress"
          description={error}
        />
      </div>
    );
  }

  if (targets.length === 0 && !participants) {
    return (
      <div className={clsx(styles.container, className)}>
        <EmptyState
          icon={<TrendingUp aria-hidden="true" />}
          title="No progress targets"
          description="Campaign targets will appear here once they are configured. No target values are fabricated."
        />
      </div>
    );
  }

  const hasParticipants = participants != null;
  const enrolled = hasParticipants ? participants!.enrolled : null;
  const active = hasParticipants ? participants!.active : null;
  const completed = hasParticipants ? participants!.completed : null;
  const unit = hasParticipants ? participants!.unit : undefined;

  return (
    <div className={clsx(styles.container, className)}>
      {title && <h3 className={styles.title}>{title}</h3>}

      {hasParticipants && (
        <div className={styles.kpiRow}>
          <KpiCard
            title="Enrolled"
            value={enrolled != null ? formatNumber(enrolled) : null}
            unit={unit}
          />
          <KpiCard
            title="Active"
            value={active != null ? formatNumber(active) : null}
            unit={unit}
          />
          <KpiCard
            title="Completed"
            value={completed != null ? formatNumber(completed) : null}
            unit={unit}
          />
        </div>
      )}

      {targets.length > 0 && (
        <div className={styles.targetGrid}>
          {targets.map((target: CampaignTarget) => {
            const result = computeTargetProgress(target.current, target.target);
            return (
              <TargetProgressCard
                key={target.id}
                label={target.label}
                value={target.current}
                target={target.target}
                progress={result.progress}
                status={result.status}
                unit={target.unit}
                formatValue={formatNumber}
                description={target.description}
              />
            );
          })}
        </div>
      )}

      {children}
    </div>
  );
}
