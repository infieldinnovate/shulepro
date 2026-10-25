"use client";

import { useMemo } from "react";
import type { ReactNode } from "react";
import { Check, AlertCircle, Target } from "lucide-react";
import clsx from "clsx";
import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import type {
  Rubric,
  RubricCriterion,
} from "@/components/features/assessment/types";
import styles from "./RubricScoringGrid.module.scss";

// ============================================================
// Types
// ============================================================

/** Map of criterionId to the selected levelKey, or null for no judgement. */
export type RubricJudgements = Record<string, string | null>;

/** Per-criterion evidence status override. */
export type RubricEvidenceOverrides = Record<string, "insufficient-evidence">;

export interface RubricScoringGridProps {
  rubric: Rubric;
  /** Pre-existing judgements keyed by criterion id. */
  judgements: RubricJudgements;
  /** Called when a level is selected or cleared for a criterion. */
  onJudgementChange: (
    criterionId: string,
    levelKey: string | null,
  ) => void;
  /** Mark a criterion as having insufficient evidence. */
  onEvidenceStatusChange?: (
    criterionId: string,
    status: "insufficient-evidence" | null,
  ) => void;
  /** Current evidence overrides keyed by criterion id. */
  evidenceOverrides?: RubricEvidenceOverrides;
  onSubmit?: () => void;
  onClear?: () => void;
  loading?: boolean;
  error?: ReactNode;
  disabled?: boolean;
  className?: string;
}

// ============================================================
// Component
// ============================================================

export function RubricScoringGrid({
  rubric,
  judgements,
  onJudgementChange,
  onEvidenceStatusChange,
  evidenceOverrides = {},
  onSubmit,
  onClear,
  loading = false,
  error,
  disabled = false,
  className,
}: RubricScoringGridProps) {
  const sortedLevels = useMemo(
    () => [...rubric.attainmentLevels].sort((a, b) => a.order - b.order),
    [rubric.attainmentLevels],
  );

  if (loading) {
    return (
      <div className={clsx(styles.container, className)}>
        <div className={styles.loadingState}>
          <Spinner size="md" label="Loading scoring grid" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={clsx(styles.container, className)}>
        <Alert
          variant="error"
          title="Unable to load scoring grid"
          description={error}
        />
      </div>
    );
  }

  if (rubric.criteria.length === 0) {
    return (
      <div className={clsx(styles.container, className)}>
        <EmptyState
          icon={<Target aria-hidden="true" />}
          title="No criteria to score"
          description="This rubric has no criteria. Add criteria in the rubric builder first."
        />
      </div>
    );
  }

  const getDescriptor = (
    criterion: RubricCriterion,
    levelKey: string,
  ): string | undefined => {
    return criterion.descriptors.find((d) => d.levelKey === levelKey)
      ?.description;
  };

  const handleLevelSelect = (
    criterionId: string,
    levelKey: string,
  ) => {
    if (disabled) return;
    const current = judgements[criterionId];
    if (current === levelKey) {
      onJudgementChange(criterionId, null);
    } else {
      onJudgementChange(criterionId, levelKey);
      onEvidenceStatusChange?.(criterionId, null);
    }
  };

  const handleInsufficientEvidence = (criterionId: string) => {
    if (disabled) return;
    const isActive = evidenceOverrides[criterionId] === "insufficient-evidence";
    if (isActive) {
      onEvidenceStatusChange?.(criterionId, null);
    } else {
      onEvidenceStatusChange?.(criterionId, "insufficient-evidence");
      onJudgementChange(criterionId, null);
    }
  };

  const totalCriteria = rubric.criteria.length;
  const assessedCount = rubric.criteria.filter(
    (c) =>
      judgements[c.id] != null ||
      evidenceOverrides[c.id] === "insufficient-evidence",
  ).length;

  return (
    <div className={clsx(styles.container, className)}>
      <div className={styles.summaryRow}>
        <Badge variant="info" size="sm">
          {assessedCount} of {totalCriteria} assessed
        </Badge>
        {rubric.scoringRule && (
          <Badge variant="neutral" size="sm">
            Scoring: {rubric.scoringRule}
          </Badge>
        )}
      </div>

      <Table
        caption="Rubric scoring grid"
        density="default"
        className={styles.grid}
      >
        <Table.Header>
          <Table.Row>
            <Table.Head className={styles.criterionHead}>
              Criterion
            </Table.Head>
            {sortedLevels.map((level) => (
              <Table.Head
                key={level.key}
                align="center"
                className={styles.levelHead}
              >
                <span className={styles.levelLabel}>
                  {level.shortLabel ?? level.label}
                </span>
              </Table.Head>
            ))}
            <Table.Head align="center" className={styles.evidenceHead}>
              Insufficient evidence
            </Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rubric.criteria.map((criterion) => {
            const selectedLevel = judgements[criterion.id];
            const isInsufficient =
              evidenceOverrides[criterion.id] === "insufficient-evidence";

            return (
              <Table.Row key={criterion.id}>
                <TableCell className={styles.criterionCell}>
                  <span className={styles.criterionLabel}>
                    {criterion.label}
                  </span>
                  {criterion.description && (
                    <span className={styles.criterionDescription}>
                      {criterion.description}
                    </span>
                  )}
                  {selectedLevel && (
                    <span className={styles.selectedDescriptor}>
                      {getDescriptor(criterion, selectedLevel) ?? "No descriptor"}
                    </span>
                  )}
                </TableCell>

                {sortedLevels.map((level) => {
                  const isSelected = selectedLevel === level.key;
                  return (
                    <TableCell
                      key={level.key}
                      align="center"
                      className={clsx(
                        styles.levelCell,
                        isSelected && styles.levelCellSelected,
                        disabled && styles.levelCellDisabled,
                      )}
                    >
                      <IconButton
                        variant="ghost"
                        size="sm"
                        className={styles.levelButton}
                        onClick={() =>
                          handleLevelSelect(criterion.id, level.key)
                        }
                        disabled={disabled}
                        aria-pressed={isSelected}
                        label={`${criterion.label}: ${level.label}${
                          isSelected ? " (selected)" : ""
                        }`}
                        title={getDescriptor(criterion, level.key)}
                      >
                        {isSelected && (
                          <Check aria-hidden="true" className={styles.checkIcon} />
                        )}
                      </IconButton>
                    </TableCell>
                  );
                })}

                <TableCell
                  align="center"
                  className={clsx(
                    styles.evidenceCell,
                    isInsufficient && styles.evidenceCellActive,
                    disabled && styles.evidenceCellDisabled,
                  )}
                >
                  <IconButton
                    variant="ghost"
                    size="sm"
                    className={styles.evidenceButton}
                    onClick={() => handleInsufficientEvidence(criterion.id)}
                    disabled={disabled}
                    aria-pressed={isInsufficient}
                    label={`${criterion.label}: insufficient evidence`}
                  >
                    <AlertCircle aria-hidden="true" />
                  </IconButton>
                </TableCell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>

      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span
            className={clsx(styles.legendDot, styles.legendDotSelected)}
            aria-hidden="true"
          />
          Selected level
        </span>
        <span className={styles.legendItem}>
          <AlertCircle
            aria-hidden="true"
            className={styles.legendIcon}
          />
          Insufficient evidence (not a failure)
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} aria-hidden="true" />
          Not assessed
        </span>
      </div>

      {(onSubmit || onClear) && (
        <div className={styles.actions}>
          {onClear && (
            <Button
              type="button"
              variant="ghost"
              onClick={onClear}
              disabled={disabled || loading}
            >
              Clear all
            </Button>
          )}
          {onSubmit && (
            <Button
              type="button"
              onClick={onSubmit}
              loading={loading}
              disabled={disabled}
            >
              Submit scores
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ---- TableCell helper (avoids importing the subcomponent separately) ----
function TableCell({
  children,
  className,
  align,
}: {
  children?: ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
}) {
  return (
    <td
      className={clsx(
        styles.cell,
        align === "center" && styles.cellCenter,
        align === "end" && styles.cellEnd,
        className,
      )}
    >
      {children}
    </td>
  );
}
