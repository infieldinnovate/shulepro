import type { ReactNode } from "react";
import { Users, AlertCircle } from "lucide-react";
import clsx from "clsx";
import { BreakdownTable } from "../../../shared/BreakdownTable";
import type { BreakdownRow } from "../../../shared/BreakdownTable";
import { DataAvailabilityNotice } from "../../../shared/DataAvailabilityNotice";
import { Badge } from "../../../ui/Badge";
import { Spinner } from "../../../ui/Spinner";
import { Alert } from "../../../ui/Alert";
import { EmptyState } from "../../../ui/EmptyState";
import { Card } from "../../../ui/Card";
import type {
  ParticipationDimension,
  ParticipationGroupEntry,
  ParticipationDataStatus,
} from "../types";
import styles from "./ParticipationBreakdown.module.scss";

export interface ParticipationBreakdownProps {
  /** Configurable dimensions to display in the breakdown. */
  dimensions: ParticipationDimension[];
  /** Optional title for the breakdown section. */
  title?: string;
  /** Optional description shown under the title. */
  description?: string;
  loading?: boolean;
  error?: string;
  /** Optional content rendered below the breakdown. */
  children?: ReactNode;
  className?: string;
}

function classifyParticipation(
  value: number | null | undefined,
): ParticipationDataStatus {
  if (value == null) return "missing";
  if (value === 0) return "zero";
  return "present";
}

function toBreakdownRow(entry: ParticipationGroupEntry): BreakdownRow {
  return {
    key: entry.key,
    category: entry.label,
    sublabel: entry.sublabel,
    value: entry.value,
    reference: entry.reference,
    target: entry.target,
    unit: entry.unit,
    onDrillDown: entry.onDrillDown,
  };
}

export function ParticipationBreakdown({
  dimensions,
  title = "Participation breakdown",
  description,
  loading = false,
  error,
  children,
  className,
}: ParticipationBreakdownProps) {
  if (loading) {
    return (
      <div className={clsx(styles.container, className)}>
        <div className={styles.loadingState}>
          <Spinner size="md" label="Loading participation breakdown" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={clsx(styles.container, className)}>
        <Alert
          variant="error"
          title="Unable to load participation breakdown"
          description={error}
        />
      </div>
    );
  }

  if (dimensions.length === 0) {
    return (
      <div className={clsx(styles.container, className)}>
        <EmptyState
          icon={<Users aria-hidden="true" />}
          title="No participation data"
          description="Participation breakdowns will appear here once dimensions and groups are configured."
        />
      </div>
    );
  }

  const hasMissingData = dimensions.some((dim) =>
    dim.groups.some((g) => classifyParticipation(g.value) === "missing"),
  );

  return (
    <div className={clsx(styles.container, className)}>
      {(title || description) && (
        <div className={styles.header}>
          {title && <h3 className={styles.title}>{title}</h3>}
          {description && (
            <p className={styles.description}>{description}</p>
          )}
        </div>
      )}

      {hasMissingData && (
        <DataAvailabilityNotice
          status="partial"
          message="Some groups have no data available. Missing data is shown distinctly from zero values — figures should be interpreted with caution."
        />
      )}

      <div className={styles.dimensionsList}>
        {dimensions.map((dimension) => {
          const rows = dimension.groups.map(toBreakdownRow);
          const dimHasMissing = dimension.groups.some(
            (g) => classifyParticipation(g.value) === "missing",
          );
          const dimHasZero = dimension.groups.some(
            (g) => classifyParticipation(g.value) === "zero",
          );

          return (
            <Card
              key={dimension.key}
              padded={false}
              className={styles.dimensionCard}
            >
              <Card.Header className={styles.dimensionHeader}>
                <div className={styles.dimensionTitleRow}>
                  <h4 className={styles.dimensionTitle}>{dimension.label}</h4>
                  {(dimHasMissing || dimHasZero) && (
                    <div className={styles.badgeRow}>
                      {dimHasMissing && (
                        <Badge variant="warning" size="sm">
                          Missing data
                        </Badge>
                      )}
                      {dimHasZero && (
                        <Badge variant="info" size="sm">
                          Has zero values
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                {dimension.summary && (
                  <p className={styles.dimensionSummary}>{dimension.summary}</p>
                )}
              </Card.Header>
              <Card.Body className={styles.dimensionBody}>
                <BreakdownTable
                  title={dimension.label}
                  categoryLabel="Group"
                  measureLabel="Participation"
                  rows={rows}
                  summary={dimension.summary ?? dimension.label}
                />
              </Card.Body>
            </Card>
          );
        })}
      </div>

      <div className={styles.causationNote}>
        <AlertCircle aria-hidden="true" className={styles.causationIcon} />
        <p className={styles.causationText}>
          Figures are presented as comparisons only. Correlations between
          dimensions do not imply causation.
        </p>
      </div>

      {children}
    </div>
  );
}
