import type { ReactNode } from "react";
import { FileText } from "lucide-react";
import clsx from "clsx";
import { Card } from "../../../ui/Card";
import { Badge } from "../../../ui/Badge";
import { Spinner } from "../../../ui/Spinner";
import { Alert } from "../../../ui/Alert";
import { EmptyState } from "../../../ui/EmptyState";
import { ReportHeader } from "../../../shared/ReportHeader";
import { ReportMetadata } from "../../../shared/ReportMetadata";
import { KpiGrid } from "../../../shared/KpiGrid";
import { KpiCard } from "../../../shared/KpiCard";
import type { KpiCardStatus } from "../../../shared/KpiCard";
import { formatAbsolute } from "@/lib/formatTime";
import type {
  ProgressReport,
  CompetencyResult,
  AttainmentLevel,
  EvidenceStatus,
} from "../types";

function toTimestamp(value: Date | string | number): string | number {
  return value instanceof Date ? value.getTime() : value;
}
import styles from "./ProgressReportCard.module.scss";

export interface ProgressReportCardProps {
  report: ProgressReport;
  attainmentLevels: AttainmentLevel[];
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

const AUDIENCE_LABEL: Record<ProgressReport["audience"], string> = {
  parent: "Parent",
  teacher: "Teacher",
  leadership: "Leadership",
  learner: "Learner",
};

function findLevelLabel(
  levelKey?: string,
  levels?: AttainmentLevel[],
): string | undefined {
  if (!levelKey || !levels) return undefined;
  return levels.find((l) => l.key === levelKey)?.label;
}

function resultToKpiCard(
  result: CompetencyResult,
  levels: AttainmentLevel[],
) {
  const levelLabel = findLevelLabel(result.levelKey, levels);
  const status = EVIDENCE_STATUS_TO_KPI[result.evidenceStatus] ?? "neutral";
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
}

export function ProgressReportCard({
  report,
  attainmentLevels,
  loading = false,
  error,
  empty = false,
  className,
}: ProgressReportCardProps) {
  if (loading) {
    return (
      <Card padded className={clsx(styles.container, className)}>
        <Spinner size="md" label="Loading progress report" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card padded className={clsx(styles.container, className)}>
        <Alert
          variant="error"
          title="Unable to load progress report"
          description={error}
        />
      </Card>
    );
  }

  if (empty || !report) {
    return (
      <Card padded className={clsx(styles.container, className)}>
        <EmptyState
          icon={<FileText aria-hidden="true" />}
          title="No progress report"
          description="An approved progress report will appear here."
        />
      </Card>
    );
  }

  return (
    <div className={clsx(styles.container, className)}>
      <ReportHeader
        title={`Progress Report — ${report.period}`}
        description={report.summary}
        reportingPeriodLabel={report.period}
        actions={
          <Badge variant="primary" size="sm">
            {AUDIENCE_LABEL[report.audience]}
          </Badge>
        }
      />

      <ReportMetadata
        generatedOn={formatAbsolute(toTimestamp(report.generatedAt))}
        items={
          report.approvedBy
            ? [
                {
                  label: "Approved by",
                  value: report.approvedBy,
                },
              ]
            : undefined
        }
      />

      {report.competencyResults.length > 0 && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Competency results</h4>
          <KpiGrid
            label="Competency results"
            columns={{ sm: 2, md: 2, lg: 3, xl: 4 }}
          >
            {report.competencyResults.map((result) =>
              resultToKpiCard(result, attainmentLevels),
            )}
          </KpiGrid>
        </div>
      )}

      {report.attendanceSummary && (
        <Card padded>
          <h4 className={styles.sectionTitle}>Attendance</h4>
          <p className={styles.bodyText}>{report.attendanceSummary}</p>
        </Card>
      )}

      {report.teacherComment && (
        <Card padded>
          <h4 className={styles.sectionTitle}>Teacher comment</h4>
          <p className={styles.bodyText}>{report.teacherComment}</p>
        </Card>
      )}

      {report.nextSteps && report.nextSteps.length > 0 && (
        <Card padded>
          <h4 className={styles.sectionTitle}>Next steps</h4>
          <ul className={styles.nextStepsList}>
            {report.nextSteps.map((step, index) => (
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
