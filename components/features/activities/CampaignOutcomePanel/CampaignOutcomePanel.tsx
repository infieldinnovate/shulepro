import type { ReactNode } from "react";
import { AlertCircle, ClipboardCheck } from "lucide-react";
import clsx from "clsx";
import { BreakdownTable } from "@/components/shared/BreakdownTable";
import type { BreakdownRow } from "@/components/shared/BreakdownTable";
import { ComparisonPanel } from "@/components/shared/ComparisonPanel";
import type { ComparisonMetric } from "@/components/shared/ComparisonPanel";
import { DataAvailabilityNotice } from "@/components/shared/DataAvailabilityNotice";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type {
  CampaignOutcome,
  ProgrammeObjective,
} from "@/components/features/activities/types";
import styles from "./CampaignOutcomePanel.module.scss";

export interface CampaignOutcomePanelProps {
  /** Configurable outcomes to display. */
  outcomes: CampaignOutcome[];
  /** Configurable objectives that outcomes are measured against. */
  objectives: ProgrammeObjective[];
  /** Optional label for the comparison reference (e.g. "Baseline"). */
  referenceLabel?: string;
  /** Optional title for the panel. */
  title?: string;
  loading?: boolean;
  error?: string;
  /** Optional content rendered below the outcomes. */
  children?: ReactNode;
  className?: string;
}

export function CampaignOutcomePanel({
  outcomes,
  objectives,
  referenceLabel = "Baseline",
  title = "Campaign outcomes",
  loading = false,
  error,
  children,
  className,
}: CampaignOutcomePanelProps) {
  if (loading) {
    return (
      <div className={clsx(styles.container, className)}>
        <div className={styles.loadingState}>
          <Spinner size="md" label="Loading campaign outcomes" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={clsx(styles.container, className)}>
        <Alert
          variant="error"
          title="Unable to load campaign outcomes"
          description={error}
        />
      </div>
    );
  }

  if (outcomes.length === 0 && objectives.length === 0) {
    return (
      <div className={clsx(styles.container, className)}>
        <EmptyState
          icon={<ClipboardCheck aria-hidden="true" />}
          title="No outcome data"
          description="Campaign outcomes will appear here once they are configured and measured."
        />
      </div>
    );
  }

  const incompleteOutcomes = outcomes.filter((o) => o.incomplete);
  const hasIncomplete = incompleteOutcomes.length > 0;

  const breakdownRows: BreakdownRow[] = outcomes.map((outcome) => {
    const matchingObjective = outcome.objectiveId
      ? objectives.find((o) => o.id === outcome.objectiveId)
      : undefined;
    return {
      key: outcome.id,
      category: outcome.label,
      sublabel: matchingObjective?.label,
      value: outcome.value,
      reference: outcome.reference,
      unit: outcome.unit,
    };
  });

  const comparisonMetrics: ComparisonMetric[] = outcomes.map((outcome) => ({
    key: outcome.id,
    label: outcome.label,
    current: outcome.value,
    reference: outcome.reference,
    unit: outcome.unit,
    description: outcome.description,
  }));

  const objectivesWithOutcomes = new Set(
    outcomes.filter((o) => o.objectiveId).map((o) => o.objectiveId),
  );
  const uncoveredObjectives = objectives.filter(
    (o) => !objectivesWithOutcomes.has(o.id),
  );

  return (
    <div className={clsx(styles.container, className)}>
      <h3 className={styles.title}>{title}</h3>

      {hasIncomplete && (
        <DataAvailabilityNotice
          status="partial"
          message={`${incompleteOutcomes.length} outcome${incompleteOutcomes.length === 1 ? "" : "s"} have incomplete data. Figures should be interpreted with caution.`}
          detail="Incomplete outcomes are marked below. No outcome values are fabricated or inferred from partial data."
        />
      )}

      {outcomes.length > 0 && (
        <Card padded={false} className={styles.breakdownCard}>
          <Card.Body className={styles.breakdownBody}>
            <BreakdownTable
              title="Outcome breakdown"
              categoryLabel="Outcome"
              measureLabel="Result"
              rows={breakdownRows}
              summary="Outcomes measured against campaign objectives"
            />
          </Card.Body>
        </Card>
      )}

      {outcomes.length > 0 && (
        <ComparisonPanel
          title="Outcomes vs baseline"
          currentLabel="Result"
          referenceLabel={referenceLabel}
          metrics={comparisonMetrics}
          summary={`Comparing campaign results against ${referenceLabel.toLowerCase()}`}
        />
      )}

      {outcomes.length > 0 && (
        <div className={styles.outcomeList}>
          {outcomes.map((outcome) => (
            <div key={outcome.id} className={styles.outcomeRow}>
              <div className={styles.outcomeInfo}>
                <span className={styles.outcomeLabel}>{outcome.label}</span>
                {outcome.description && (
                  <span className={styles.outcomeDescription}>
                    {outcome.description}
                  </span>
                )}
              </div>
              {outcome.incomplete && (
                <Badge variant="warning" size="sm">
                  Incomplete
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}

      {uncoveredObjectives.length > 0 && (
        <div className={styles.uncoveredSection}>
          <div className={styles.uncoveredHeader}>
            <AlertCircle aria-hidden="true" className={styles.uncoveredIcon} />
            <h4 className={styles.uncoveredTitle}>
              Objectives without measured outcomes
            </h4>
          </div>
          <ul className={styles.uncoveredList}>
            {uncoveredObjectives.map((obj) => (
              <li key={obj.id} className={styles.uncoveredItem}>
                {obj.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {children}
    </div>
  );
}
