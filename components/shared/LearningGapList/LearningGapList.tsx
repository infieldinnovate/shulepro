import type { ReactNode } from "react";
import { Info, ChevronRight, TriangleAlert as AlertTriangle, OctagonAlert as AlertOctagon, CircleAlert as AlertCircle } from "lucide-react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Alert } from "@/components/ui/Alert";
import styles from "./LearningGapList.module.scss";

export type LearningGapSeverity = "critical" | "major" | "minor";
export type LearningGapScope = "learner" | "cohort" | "class" | "group";

export interface LearningGap {
  key: string;
  area: string;
  description?: string;
  severity: LearningGapSeverity;
  measure: number | null | undefined;
  unit?: string;
  formatMeasure?: (n: number) => string;
  referenceLabel: string;
  referenceScope: LearningGapScope;
  intervention?: string;
  onDrillDown?: () => void;
}

export interface LearningGapListProps {
  title: string;
  gaps: LearningGap[];
  loading?: boolean;
  error?: string;
  empty?: boolean;
  summary?: string;
  className?: string;
  children?: ReactNode;
}

function defaultFormat(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

const SEVERITY_CONFIG: Record<
  LearningGapSeverity,
  { variant: "error" | "warning" | "info"; icon: ReactNode; label: string }
> = {
  critical: {
    variant: "error",
    icon: <AlertOctagon aria-hidden="true" size={14} />,
    label: "Critical",
  },
  major: {
    variant: "warning",
    icon: <AlertCircle aria-hidden="true" size={14} />,
    label: "Major",
  },
  minor: {
    variant: "info",
    icon: <AlertTriangle aria-hidden="true" size={14} />,
    label: "Minor",
  },
};

const SCOPE_LABEL: Record<LearningGapScope, string> = {
  learner: "Learner",
  cohort: "Cohort",
  class: "Class",
  group: "Group",
};

export function LearningGapList({
  title,
  gaps,
  loading = false,
  error,
  empty = false,
  summary,
  className,
  children,
}: LearningGapListProps) {
  const sortedGaps = [...gaps].sort((a, b) => {
    const order: Record<LearningGapSeverity, number> = {
      critical: 0,
      major: 1,
      minor: 2,
    };
    return order[a.severity] - order[b.severity];
  });

  const body = (() => {
    if (loading) {
      return (
        <div className={styles.loadingBody}>
          <Spinner size="md" label={`Loading ${title}`} />
        </div>
      );
    }
    if (error) {
      return <Alert variant="error" title="Data unavailable" description={error} />;
    }
    if (empty || gaps.length === 0) {
      return (
        <EmptyState
          icon={<Info aria-hidden="true" />}
          title="No learning gaps"
          description={`There are no learning gaps recorded for ${title.toLowerCase()} yet.`}
        />
      );
    }
    return (
      <ul className={styles.list} aria-label={summary ?? title}>
        {sortedGaps.map((gap) => {
          const fmt = gap.formatMeasure ?? defaultFormat;
          const unit = gap.unit ?? "";
          const sev = SEVERITY_CONFIG[gap.severity];
          const interactive = Boolean(gap.onDrillDown);
          const measureMissing = gap.measure == null;

          return (
            <li key={gap.key} className={styles.gapItem}>
              <div
                className={clsx(styles.gapRow, interactive && styles.interactive)}
                role={interactive ? "button" : undefined}
                tabIndex={interactive ? 0 : undefined}
                aria-label={
                  interactive
                    ? `View details for learning gap: ${gap.area} (${gap.referenceLabel})`
                    : undefined
                }
                onClick={interactive ? gap.onDrillDown : undefined}
                onKeyDown={
                  interactive
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          gap.onDrillDown?.();
                        }
                      }
                    : undefined
                }
              >
                <span className={styles.severityCol}>
                  <Badge variant={sev.variant} size="sm" icon={sev.icon}>
                    {sev.label}
                  </Badge>
                </span>
                <div className={styles.detailCol}>
                  <span className={styles.area}>{gap.area}</span>
                  {gap.description && (
                    <span className={styles.description}>{gap.description}</span>
                  )}
                  <span className={styles.reference}>
                    <span className={styles.referenceScope}>
                      {SCOPE_LABEL[gap.referenceScope]}:
                    </span>{" "}
                    <span className={styles.referenceLabel}>
                      {gap.referenceLabel}
                    </span>
                  </span>
                  {gap.intervention && (
                    <span className={styles.intervention}>
                      <span className={styles.interventionLabel}>
                        Suggested:
                      </span>{" "}
                      {gap.intervention}
                    </span>
                  )}
                </div>
                <div className={styles.measureCol}>
                  {measureMissing ? (
                    <Badge variant="warning" size="sm">
                      No data
                    </Badge>
                  ) : (
                    <span className={styles.measureValue}>
                      {fmt(gap.measure!)}
                      {unit && <span className={styles.unit}> {unit}</span>}
                    </span>
                  )}
                </div>
                {interactive && (
                  <span className={styles.drillIcon}>
                    <ChevronRight aria-hidden="true" size={16} />
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    );
  })();

  return (
    <Card className={clsx(styles.card, className)} padded>
      <Card.Header className={styles.header}>
        <h4 className={styles.title}>{title}</h4>
      </Card.Header>
      <Card.Body className={styles.body}>
        {body}
        {children}
      </Card.Body>
    </Card>
  );
}
