import type { ReactNode } from "react";
import { User } from "lucide-react";
import clsx from "clsx";
import { Card } from "../../../ui/Card";
import { Avatar } from "../../../ui/Avatar";
import { Spinner } from "../../../ui/Spinner";
import { Alert } from "../../../ui/Alert";
import { EmptyState } from "../../../ui/EmptyState";
import { KpiGrid } from "../../../shared/KpiGrid";
import { KpiCard } from "../../../shared/KpiCard";
import type { KpiCardStatus } from "../../../shared/KpiCard";
import type {
  CompetencyResult,
  AttainmentLevel,
  EvidenceStatus,
} from "../types";
import styles from "./ParentProgressSummary.module.scss";

export interface ParentProgressSummaryProps {
  learnerName: string;
  learnerAvatar?: string;
  learnerInitials?: string;
  period: string;
  summary: string;
  competencyResults: CompetencyResult[];
  attainmentLevels: AttainmentLevel[];
  attendanceSummary?: string;
  nextSteps?: string[];
  loading?: boolean;
  error?: ReactNode;
  empty?: boolean;
  className?: string;
}

const EVIDENCE_STATUS_TO_KPI: Record<EvidenceStatus, KpiCardStatus> = {
  demonstrated: "good",
  "partially-demonstrated": "warning",
  "not-yet-demonstrated": "critical",
  "insufficient-evidence": "warning",
  "not-assessed": "neutral",
};

function findLevelLabel(
  levelKey?: string,
  levels?: AttainmentLevel[],
): string | undefined {
  if (!levelKey || !levels) return undefined;
  return levels.find((l) => l.key === levelKey)?.label;
}

export function ParentProgressSummary({
  learnerName,
  learnerAvatar,
  learnerInitials,
  period,
  summary,
  competencyResults,
  attainmentLevels,
  attendanceSummary,
  nextSteps,
  loading = false,
  error,
  empty = false,
  className,
}: ParentProgressSummaryProps) {
  if (loading) {
    return (
      <Card padded className={clsx(styles.container, className)}>
        <Spinner size="md" label="Loading progress summary" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card padded className={clsx(styles.container, className)}>
        <Alert
          variant="error"
          title="Unable to load progress summary"
          description={error}
        />
      </Card>
    );
  }

  if (empty || !learnerName) {
    return (
      <Card padded className={clsx(styles.container, className)}>
        <EmptyState
          icon={<User aria-hidden="true" />}
          title="No progress summary"
          description="A progress summary for your child will appear here."
        />
      </Card>
    );
  }

  return (
    <div className={clsx(styles.container, className)}>
      <Card padded>
        <div className={styles.header}>
          <Avatar
            src={learnerAvatar}
            name={learnerInitials ?? learnerName}
            alt={`Avatar for ${learnerName}`}
            size="md"
          />
          <div className={styles.headerText}>
            <h3 className={styles.learnerName}>{learnerName}</h3>
            <p className={styles.period}>{period}</p>
          </div>
        </div>
        <p className={styles.summary}>{summary}</p>
      </Card>

      {competencyResults.length > 0 && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Learning progress</h4>
          <KpiGrid
            label="Competency progress"
            columns={{ sm: 1, md: 2, lg: 3 }}
          >
            {competencyResults.map((result) => {
              const levelLabel = findLevelLabel(
                result.levelKey,
                attainmentLevels,
              );
              const status =
                EVIDENCE_STATUS_TO_KPI[result.evidenceStatus] ?? "neutral";
              const value =
                result.value != null
                  ? result.value
                  : levelLabel ?? result.evidenceStatus;
              return (
                <KpiCard
                  key={result.key}
                  title={result.label}
                  value={value}
                  unit={result.unit}
                  status={status}
                  description={levelLabel}
                />
              );
            })}
          </KpiGrid>
        </div>
      )}

      {attendanceSummary && (
        <Card padded>
          <h4 className={styles.sectionTitle}>Attendance</h4>
          <p className={styles.bodyText}>{attendanceSummary}</p>
        </Card>
      )}

      {nextSteps && nextSteps.length > 0 && (
        <Card padded>
          <h4 className={styles.sectionTitle}>Next steps</h4>
          <ul className={styles.nextStepsList}>
            {nextSteps.map((step, index) => (
              <li key={index} className={styles.nextStepItem}>
                {step}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
