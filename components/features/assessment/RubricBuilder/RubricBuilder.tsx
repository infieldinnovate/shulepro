"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import clsx from "clsx";
import { Card } from "../../../ui/Card";
import { Button } from "../../../ui/Button";
import { IconButton } from "../../../ui/Button";
import { Input } from "../../../ui/Input";
import { Textarea } from "../../../ui/Textarea";
import { Select } from "../../../ui/Select";
import type { SelectOption } from "../../../ui/Select";
import { FormField } from "../../../ui/FormField";
import { Spinner } from "../../../ui/Spinner";
import { Alert } from "../../../ui/Alert";
import { EmptyState } from "../../../ui/EmptyState";
import { FormSection } from "../../../shared/FormSection";
import { FormActions } from "../../../shared/FormActions";
import { FormErrorSummary } from "../../../shared/FormErrorSummary";
import type { FormErrorEntry } from "../../../shared/FormErrorSummary";
import { ConfirmActionDialog } from "../../../shared/ConfirmActionDialog";
import type {
  AttainmentLevel,
  Rubric,
  RubricCriterion,
} from "../types";
import styles from "./RubricBuilder.module.scss";

// ============================================================
// Scoring rule options — configurable, not prescriptive
// ============================================================

export const DEFAULT_SCORING_RULE_OPTIONS: SelectOption[] = [
  { value: "", label: "No scoring rule" },
  { value: "weighted-average", label: "Weighted average" },
  { value: "highest-level", label: "Highest level" },
  { value: "custom", label: "Custom" },
];

// ============================================================
// Types
// ============================================================

export interface RubricBuilderProps {
  /** Existing rubric for edit mode. Omit for create mode. */
  rubric?: Rubric;
  /** Configurable attainment levels — supplied, not hardcoded. */
  attainmentLevels: AttainmentLevel[];
  /** Emits the updated rubric on every change. */
  onChange: (rubric: Rubric) => void;
  /** Optional save callback. */
  onSave?: (rubric: Rubric) => void;
  onCancel?: () => void;
  loading?: boolean;
  error?: ReactNode;
  /** Override the scoring rule options. */
  scoringRuleOptions?: SelectOption[];
  className?: string;
}

interface ValidationEntry {
  field: string;
  fieldLabel?: string;
  message: string;
}

// ============================================================
// Helpers
// ============================================================

function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function createEmptyRubric(attainmentLevels: AttainmentLevel[]): Rubric {
  return {
    id: generateId("rubric"),
    title: "",
    criteria: [],
    attainmentLevels,
    scoringRule: "",
  };
}

function createEmptyCriterion(
  attainmentLevels: AttainmentLevel[],
): RubricCriterion {
  return {
    id: generateId("criterion"),
    label: "",
    description: "",
    weight: undefined,
    descriptors: attainmentLevels.map((level) => ({
      levelKey: level.key,
      description: "",
    })),
  };
}

function validateRubric(rubric: Rubric): ValidationEntry[] {
  const errors: ValidationEntry[] = [];

  if (!rubric.title.trim()) {
    errors.push({
      field: "rubric-title",
      fieldLabel: "Rubric title",
      message: "Rubric title is required",
    });
  }

  if (rubric.criteria.length === 0) {
    errors.push({
      field: "criteria",
      fieldLabel: "Criteria",
      message: "Add at least one criterion",
    });
  }

  rubric.criteria.forEach((criterion, index) => {
    if (!criterion.label.trim()) {
      errors.push({
        field: `criterion-${index}-label`,
        fieldLabel: `Criterion ${index + 1} label`,
        message: "Criterion label is required",
      });
    }
    criterion.descriptors.forEach((desc, dIndex) => {
      if (!desc.description.trim()) {
        errors.push({
          field: `criterion-${index}-descriptor-${dIndex}`,
          fieldLabel: `Criterion ${index + 1}, ${desc.levelKey}`,
          message: "Descriptor description is required",
        });
      }
    });
  });

  return errors;
}

// ============================================================
// Component
// ============================================================

export function RubricBuilder({
  rubric,
  attainmentLevels,
  onChange,
  onSave,
  onCancel,
  loading = false,
  error,
  scoringRuleOptions = DEFAULT_SCORING_RULE_OPTIONS,
  className,
}: RubricBuilderProps) {
  const [internalRubric, setInternalRubric] = useState<Rubric>(
    rubric ?? createEmptyRubric(attainmentLevels),
  );
  const [validationErrors, setValidationErrors] = useState<ValidationEntry[]>(
    [],
  );
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(
    null,
  );

  const updateRubric = (next: Rubric) => {
    setInternalRubric(next);
    onChange(next);
  };

  const handleTitleChange = (value: string) => {
    updateRubric({ ...internalRubric, title: value });
  };

  const handleScoringRuleChange = (value: string) => {
    updateRubric({ ...internalRubric, scoringRule: value || undefined });
  };

  const addCriterion = () => {
    const newCriterion = createEmptyCriterion(attainmentLevels);
    updateRubric({
      ...internalRubric,
      criteria: [...internalRubric.criteria, newCriterion],
    });
  };

  const removeCriterion = (index: number) => {
    updateRubric({
      ...internalRubric,
      criteria: internalRubric.criteria.filter(
        (_: RubricCriterion, i: number) => i !== index,
      ),
    });
    setPendingDeleteIndex(null);
  };

  const moveCriterion = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= internalRubric.criteria.length) return;
    const criteria = [...internalRubric.criteria];
    [criteria[index], criteria[target]] = [
      criteria[target],
      criteria[index],
    ];
    updateRubric({ ...internalRubric, criteria });
  };

  const updateCriterion = (index: number, patch: Partial<RubricCriterion>) => {
    const criteria = [...internalRubric.criteria];
    criteria[index] = { ...criteria[index], ...patch };
    updateRubric({ ...internalRubric, criteria });
  };

  const updateDescriptor = (
    criterionIndex: number,
    levelKey: string,
    description: string,
    score?: number,
  ) => {
    const criteria = [...internalRubric.criteria];
    const descriptors = [...criteria[criterionIndex].descriptors];
    const descIndex = descriptors.findIndex((d) => d.levelKey === levelKey);
    if (descIndex >= 0) {
      descriptors[descIndex] = { ...descriptors[descIndex], description, score };
    } else {
      descriptors.push({ levelKey, description, score });
    }
    criteria[criterionIndex] = {
      ...criteria[criterionIndex],
      descriptors,
    };
    updateRubric({ ...internalRubric, criteria });
  };

  const handleSave = () => {
    const errors = validateRubric(internalRubric);
    setValidationErrors(errors);
    if (errors.length > 0) return;
    onSave?.(internalRubric);
  };

  const errorEntries: FormErrorEntry[] = validationErrors.map((e) => ({
    field: e.field,
    fieldLabel: e.fieldLabel,
    message: e.message,
  }));

  if (loading) {
    return (
      <div className={clsx(styles.container, className)}>
        <Card padded className={styles.loadingCard}>
          <Spinner size="md" label="Loading rubric builder" />
        </Card>
      </div>
    );
  }

  const sortedLevels = [...attainmentLevels].sort((a, b) => a.order - b.order);

  return (
    <div className={clsx(styles.container, className)}>
      {error && (
        <Alert variant="error" title="Unable to load rubric" description={error} />
      )}

      {errorEntries.length > 0 && (
        <FormErrorSummary
          errors={errorEntries}
          onFocusField={(fieldId) => {
            const el = document.getElementById(fieldId);
            el?.focus();
          }}
        />
      )}

      <FormSection
        title="Rubric details"
        description="Name the rubric and choose how scores are calculated."
      >
        <FormField label="Rubric title" required>
          <Input
            id="rubric-title"
            value={internalRubric.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="e.g. Oral reading assessment rubric"
          />
        </FormField>

        <FormField
          label="Scoring rule"
          helperText="How criterion judgements combine into a final score."
        >
          <Select
            value={internalRubric.scoringRule ?? ""}
            onChange={(e) => handleScoringRuleChange(e.target.value)}
            options={scoringRuleOptions}
          />
        </FormField>
      </FormSection>

      {internalRubric.criteria.length === 0 ? (
        <Card padded>
          <EmptyState
            icon={<Plus aria-hidden="true" />}
            title="No criteria yet"
            description="Add criteria to define what is being assessed."
            primaryAction={
              <Button
                type="button"
                variant="outline"
                leftIcon={<Plus aria-hidden="true" />}
                onClick={addCriterion}
              >
                Add criterion
              </Button>
            }
          />
        </Card>
      ) : (
        <div className={styles.criteriaList}>
          {internalRubric.criteria.map((criterion, index) => (
            <Card key={criterion.id} padded className={styles.criterionCard}>
              <div className={styles.criterionHeader}>
                <div className={styles.criterionTitleRow}>
                  <span className={styles.criterionIndex}>
                    Criterion {index + 1}
                  </span>
                  <div className={styles.criterionActions}>
                    <IconButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      label="Move criterion up"
                      onClick={() => moveCriterion(index, "up")}
                      disabled={index === 0}
                    >
                      <ChevronUp aria-hidden="true" />
                    </IconButton>
                    <IconButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      label="Move criterion down"
                      onClick={() => moveCriterion(index, "down")}
                      disabled={
                        index === internalRubric.criteria.length - 1
                      }
                    >
                      <ChevronDown aria-hidden="true" />
                    </IconButton>
                    <IconButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      label="Delete criterion"
                      onClick={() => setPendingDeleteIndex(index)}
                    >
                      <Trash2 aria-hidden="true" />
                    </IconButton>
                  </div>
                </div>
              </div>

              <div className={styles.criterionBody}>
                <FormField
                  label="Label"
                  required
                  errorText={
                    !criterion.label.trim()
                      ? "Criterion label is required"
                      : undefined
                  }
                  invalid={!criterion.label.trim()}
                >
                  <Input
                    id={`criterion-${index}-label`}
                    value={criterion.label}
                    onChange={(e) =>
                      updateCriterion(index, { label: e.target.value })
                    }
                    placeholder="e.g. Fluency"
                    invalid={!criterion.label.trim()}
                  />
                </FormField>

                <FormField label="Description">
                  <Textarea
                    value={criterion.description ?? ""}
                    onChange={(e) =>
                      updateCriterion(index, { description: e.target.value })
                    }
                    placeholder="What this criterion measures"
                    rows={2}
                  />
                </FormField>

                <FormField
                  label="Weight"
                  helperText="Optional numeric weight for scoring."
                >
                  <Input
                    type="number"
                    min={0}
                    step="0.1"
                    value={
                      criterion.weight != null ? String(criterion.weight) : ""
                    }
                    onChange={(e) =>
                      updateCriterion(index, {
                        weight:
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value),
                      })
                    }
                    placeholder="e.g. 1.5"
                  />
                </FormField>

                <div className={styles.descriptorsSection}>
                  <h4 className={styles.descriptorsTitle}>
                    Descriptors by attainment level
                  </h4>
                  <div className={styles.descriptorsGrid}>
                    {sortedLevels.map((level) => {
                      const descriptor = criterion.descriptors.find(
                        (d) => d.levelKey === level.key,
                      );
                      return (
                        <div key={level.key} className={styles.descriptorField}>
                          <FormField
                            label={level.label}
                            helperText={level.description}
                          >
                            <Textarea
                              value={descriptor?.description ?? ""}
                              onChange={(e) =>
                                updateDescriptor(
                                  index,
                                  level.key,
                                  e.target.value,
                                  descriptor?.score,
                                )
                              }
                              placeholder={`Describe what "${level.label}" looks like`}
                              rows={2}
                            />
                          </FormField>
                          <FormField label="Score">
                            <Input
                              type="number"
                              value={
                                descriptor?.score != null
                                  ? String(descriptor.score)
                                  : ""
                              }
                              onChange={(e) =>
                                updateDescriptor(
                                  index,
                                  level.key,
                                  descriptor?.description ?? "",
                                  e.target.value === ""
                                    ? undefined
                                    : Number(e.target.value),
                                )
                              }
                              placeholder="Optional"
                            />
                          </FormField>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>
          ))}

          <Button
            type="button"
            variant="outline"
            leftIcon={<Plus aria-hidden="true" />}
            onClick={addCriterion}
            className={styles.addCriterionBtn}
          >
            Add criterion
          </Button>
        </div>
      )}

      {(onSave || onCancel) && (
        <FormActions
          cancel={
            onCancel ? (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            ) : undefined
          }
          submit={
            onSave ? (
              <Button type="button" onClick={handleSave} loading={loading}>
                Save rubric
              </Button>
            ) : undefined
          }
        />
      )}

      <ConfirmActionDialog
        open={pendingDeleteIndex !== null}
        onConfirm={() =>
          pendingDeleteIndex !== null && removeCriterion(pendingDeleteIndex)
        }
        onCancel={() => setPendingDeleteIndex(null)}
        title="Delete criterion?"
        description="This will remove the criterion and all its descriptors. This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Keep"
      />
    </div>
  );
}
