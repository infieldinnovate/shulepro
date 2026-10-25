"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import {
  useFormContext,
  useFieldArray,
  useWatch,
} from "react-hook-form";
import type { FieldValues, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { Plus, Trash as Trash2, ChevronUp, ChevronDown } from "lucide-react";
import clsx from "clsx";
import { MultiStepForm } from "@/components/shared/MultiStepForm";
import type { MultiStepFormStep } from "@/components/shared/MultiStepForm";
import { FormSection } from "@/components/shared/FormSection";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import type { SelectOption } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { AttainmentLevel, AssessmentActivity } from "@/components/features/assessment/types";
import styles from "./AssessmentBuilder.module.scss";

// ============================================================
// Form values & output types
// ============================================================

export interface AttainmentLevelFormEntry {
  key: string;
  label: string;
  shortLabel?: string;
  description?: string;
  order: number;
}

export interface AssessmentBuilderData {
  title: string;
  learningAreaRef: string;
  description?: string;
  dueDate?: string;
  instructions?: string;
  competencies: string[];
  rubricId?: string;
  attainmentLevels: AttainmentLevel[];
}

interface AssessmentFormValues extends FieldValues {
  title: string;
  learningAreaRef: string;
  description: string;
  dueDate: string;
  instructions: string;
  competencies: string[];
  rubricId: string;
  attainmentLevels: AttainmentLevelFormEntry[];
}

// ============================================================
// Zod schemas — per-step validation
// ============================================================

const attainmentLevelSchema = z.object({
  key: z.string().min(1, "Key is required"),
  label: z.string().min(1, "Label is required"),
  shortLabel: z.string().optional(),
  description: z.string().optional(),
  order: z.coerce.number().min(0, "Order must be 0 or greater"),
});

const detailsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  learningAreaRef: z.string().min(1, "Learning area is required"),
}) as unknown as z.ZodType<AssessmentFormValues>;

const competenciesSchema = z.object({
  competencies: z
    .array(z.string())
    .min(1, "Add at least one competency"),
}) as unknown as z.ZodType<AssessmentFormValues>;

const rubricSchema = z.object({}) as unknown as z.ZodType<AssessmentFormValues>;

const attainmentSchema = z.object({
  attainmentLevels: z
    .array(attainmentLevelSchema)
    .min(1, "Add at least one attainment level"),
}) as unknown as z.ZodType<AssessmentFormValues>;

// ============================================================
// Props
// ============================================================

export interface AssessmentBuilderProps {
  /** Existing activity for edit mode. Omit for create mode. */
  activity?: AssessmentActivity;
  /** Selectable learning areas for the details step. */
  learningAreaOptions?: SelectOption[];
  /** Selectable rubrics for the rubric step. */
  rubricOptions?: SelectOption[];
  /** Called with the form data on submit. Does NOT persist. */
  onSubmit: (data: AssessmentBuilderData) => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  error?: ReactNode;
  className?: string;
}

// ============================================================
// Step field sub-components (useFormContext consumers)
// ============================================================

function DetailsStepFields({
  learningAreaOptions,
}: {
  learningAreaOptions?: SelectOption[];
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext<AssessmentFormValues>();

  return (
    <FormSection
      title="Activity details"
      description="Name the assessment and choose the learning area it belongs to."
    >
      <FormField
        label="Title"
        required
        errorText={errors.title?.message as string | undefined}
        invalid={!!errors.title}
      >
        <Input
          {...register("title")}
          placeholder="e.g. Mid-term oral reading assessment"
          invalid={!!errors.title}
        />
      </FormField>

      <FormField
        label="Learning area"
        required
        errorText={errors.learningAreaRef?.message as string | undefined}
        invalid={!!errors.learningAreaRef}
      >
        {learningAreaOptions && learningAreaOptions.length > 0 ? (
          <Select
            {...register("learningAreaRef")}
            options={learningAreaOptions}
            placeholder="Select a learning area"
            invalid={!!errors.learningAreaRef}
          />
        ) : (
          <Input
            {...register("learningAreaRef")}
            placeholder="Enter learning area reference"
            invalid={!!errors.learningAreaRef}
          />
        )}
      </FormField>

      <FormField label="Description" helperText="Brief summary of the assessment.">
        <Textarea
          {...register("description")}
          placeholder="What will learners be assessed on?"
          rows={3}
        />
      </FormField>

      <FormField label="Due date" helperText="When submissions are expected.">
        <Input {...register("dueDate")} type="date" />
      </FormField>

      <FormField label="Instructions" helperText="Optional guidance for learners or assessors.">
        <Textarea
          {...register("instructions")}
          placeholder="Step-by-step instructions..."
          rows={3}
        />
      </FormField>
    </FormSection>
  );
}

function CompetenciesStepFields() {
  const {
    setValue,
    formState: { errors },
  } = useFormContext<AssessmentFormValues>();
  const competencies = useWatch({ name: "competencies" }) ?? [];
  const [inputValue, setInputValue] = useState("");

  const addCompetency = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    if (competencies.includes(trimmed)) {
      setInputValue("");
      return;
    }
    setValue("competencies", [...competencies, trimmed], {
      shouldDirty: true,
    });
    setInputValue("");
  };

  const removeCompetency = (index: number) => {
    setValue(
      "competencies",
      competencies.filter((_: string, i: number) => i !== index),
      { shouldDirty: true },
    );
  };

  const competencyError = errors.competencies?.message as string | undefined;

  return (
    <FormSection
      title="Competencies"
      description="Add competency or strand references this assessment covers."
    >
      <div className={styles.competencyInput}>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCompetency();
            }
          }}
          placeholder="Competency key or label"
          aria-label="Add competency"
        />
        <Button
          type="button"
          variant="outline"
          leftIcon={<Plus aria-hidden="true" />}
          onClick={addCompetency}
          disabled={!inputValue.trim()}
        >
          Add
        </Button>
      </div>

      {competencyError && (
        <p className={styles.fieldError} role="alert">
          {competencyError}
        </p>
      )}

      {competencies.length > 0 ? (
        <div className={styles.tagList}>
          {competencies.map((comp: string, index: number) => (
            <span key={`${comp}-${index}`} className={styles.tag}>
              <Badge variant="neutral" size="sm">
                {comp}
              </Badge>
              <IconButton
                type="button"
                variant="ghost"
                size="sm"
                label={`Remove ${comp}`}
                onClick={() => removeCompetency(index)}
                className={styles.tagRemove}
              >
                <Trash2 aria-hidden="true" />
              </IconButton>
            </span>
          ))}
        </div>
      ) : (
        <p className={styles.emptyHint}>No competencies added yet.</p>
      )}
    </FormSection>
  );
}

function RubricStepFields({
  rubricOptions,
}: {
  rubricOptions?: SelectOption[];
}) {
  const { register } = useFormContext<AssessmentFormValues>();

  return (
    <FormSection
      title="Rubric"
      description="Link a rubric to this assessment, or skip to define one later."
    >
      <FormField
        label="Rubric"
        helperText="Choose a pre-configured rubric or enter a reference."
      >
        {rubricOptions && rubricOptions.length > 0 ? (
          <Select
            {...register("rubricId")}
            options={rubricOptions}
            placeholder="Select a rubric (optional)"
          />
        ) : (
          <Input
            {...register("rubricId")}
            placeholder="Rubric reference (optional)"
          />
        )}
      </FormField>
    </FormSection>
  );
}

function AttainmentLevelsStepFields() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<AssessmentFormValues>();
  const { fields, append, remove, swap } = useFieldArray({
    control,
    name: "attainmentLevels",
  });

  const levelsError = errors.attainmentLevels?.message as string | undefined;
  const nextOrder = fields.length > 0 ? fields.length : 0;

  return (
    <FormSection
      title="Attainment levels"
      description="Define the configurable scale for this assessment. These are NOT pre-set CBC levels — add your own."
    >
      {levelsError && (
        <p className={styles.fieldError} role="alert">
          {levelsError}
        </p>
      )}

      {fields.length > 0 && (
        <div className={styles.levelList}>
          {fields.map((field, index) => (
            <div key={field.id} className={styles.levelRow}>
              <div className={styles.levelRowFields}>
                <FormField label="Key" required>
                  <Input
                    {...register(`attainmentLevels.${index}.key`)}
                    placeholder="e.g. level-1"
                    invalid={!!errors.attainmentLevels?.[index]?.key}
                  />
                </FormField>
                <FormField label="Label" required>
                  <Input
                    {...register(`attainmentLevels.${index}.label`)}
                    placeholder="e.g. Below expectation"
                    invalid={!!errors.attainmentLevels?.[index]?.label}
                  />
                </FormField>
                <FormField label="Short label">
                  <Input
                    {...register(`attainmentLevels.${index}.shortLabel`)}
                    placeholder="e.g. BE"
                  />
                </FormField>
                <FormField label="Order" required>
                  <Input
                    {...register(`attainmentLevels.${index}.order`, {
                      valueAsNumber: true,
                    })}
                    type="number"
                    min={0}
                  />
                </FormField>
                <FormField label="Description">
                  <Input
                    {...register(`attainmentLevels.${index}.description`)}
                    placeholder="Optional description"
                  />
                </FormField>
              </div>
              <div className={styles.levelRowActions}>
                <IconButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  label="Move up"
                  onClick={() => index > 0 && swap(index, index - 1)}
                  disabled={index === 0}
                >
                  <ChevronUp aria-hidden="true" />
                </IconButton>
                <IconButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  label="Move down"
                  onClick={() =>
                    index < fields.length - 1 && swap(index, index + 1)
                  }
                  disabled={index === fields.length - 1}
                >
                  <ChevronDown aria-hidden="true" />
                </IconButton>
                <IconButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  label="Remove level"
                  onClick={() => remove(index)}
                >
                  <Trash2 aria-hidden="true" />
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        leftIcon={<Plus aria-hidden="true" />}
        onClick={() =>
          append({
            key: "",
            label: "",
            shortLabel: "",
            description: "",
            order: nextOrder,
          })
        }
      >
        Add attainment level
      </Button>
    </FormSection>
  );
}

// ============================================================
// Helpers
// ============================================================

function activityToDefaultValues(
  activity?: AssessmentActivity,
): AssessmentFormValues {
  if (!activity) {
    return {
      title: "",
      learningAreaRef: "",
      description: "",
      dueDate: "",
      instructions: "",
      competencies: [],
      rubricId: "",
      attainmentLevels: [],
    };
  }

  return {
    title: activity.title,
    learningAreaRef: activity.learningAreaRef,
    description: activity.description ?? "",
    dueDate: activity.dueDate
      ? typeof activity.dueDate === "string"
        ? activity.dueDate.split("T")[0]
        : activity.dueDate.toISOString().split("T")[0]
      : "",
    instructions: activity.instructions ?? "",
    competencies: [...activity.competencies],
    rubricId: "",
    attainmentLevels: activity.attainmentLevels.map((l) => ({
      key: l.key,
      label: l.label,
      shortLabel: l.shortLabel ?? "",
      description: l.description ?? "",
      order: l.order,
    })),
  };
}

function formValuesToData(
  values: AssessmentFormValues,
): AssessmentBuilderData {
  return {
    title: values.title,
    learningAreaRef: values.learningAreaRef,
    description: values.description || undefined,
    dueDate: values.dueDate || undefined,
    instructions: values.instructions || undefined,
    competencies: values.competencies,
    rubricId: values.rubricId || undefined,
    attainmentLevels: values.attainmentLevels.map((l) => ({
      key: l.key,
      label: l.label,
      shortLabel: l.shortLabel || undefined,
      description: l.description || undefined,
      order: l.order,
    })),
  };
}

function levelListLabel(values: AssessmentFormValues): string {
  if (!values.attainmentLevels || values.attainmentLevels.length === 0)
    return "None";
  return values.attainmentLevels
    .map((l) => l.shortLabel || l.label)
    .join(", ");
}

// ============================================================
// Main component
// ============================================================

export function AssessmentBuilder({
  activity,
  learningAreaOptions,
  rubricOptions,
  onSubmit,
  onCancel,
  loading = false,
  error,
  className,
}: AssessmentBuilderProps) {
  const defaultValues = activityToDefaultValues(activity);
  const isEditMode = Boolean(activity);

  const handleSubmit: SubmitHandler<AssessmentFormValues> = (values) => {
    onSubmit(formValuesToData(values));
  };

  const steps: MultiStepFormStep<AssessmentFormValues>[] = [
    {
      id: "details",
      title: "Details",
      description: "Title, learning area, and description.",
      schema: detailsSchema,
      fields: <DetailsStepFields learningAreaOptions={learningAreaOptions} />,
      buildSummary: (v) => ({
        stepTitle: "Details",
        fields: [
          { label: "Title", value: v.title },
          { label: "Learning area", value: v.learningAreaRef },
          { label: "Description", value: v.description || undefined },
          { label: "Due date", value: v.dueDate || undefined },
          { label: "Instructions", value: v.instructions || undefined },
        ],
      }),
    },
    {
      id: "competencies",
      title: "Competencies",
      description: "Competency and strand references.",
      schema: competenciesSchema,
      fields: <CompetenciesStepFields />,
      buildSummary: (v) => ({
        stepTitle: "Competencies",
        fields: [
          {
            label: "Competencies",
            value:
              v.competencies.length > 0
                ? v.competencies.join(", ")
                : undefined,
          },
        ],
      }),
    },
    {
      id: "rubric",
      title: "Rubric",
      description: "Link a rubric to this assessment.",
      schema: rubricSchema,
      fields: <RubricStepFields rubricOptions={rubricOptions} />,
      buildSummary: (v) => ({
        stepTitle: "Rubric",
        fields: [{ label: "Rubric", value: v.rubricId || undefined }],
      }),
    },
    {
      id: "attainment-levels",
      title: "Attainment levels",
      description: "Configurable scale — not a fixed CBC scale.",
      schema: attainmentSchema,
      fields: <AttainmentLevelsStepFields />,
      buildSummary: (v) => ({
        stepTitle: "Attainment levels",
        fields: [
          {
            label: "Levels",
            value: levelListLabel(v),
          },
          {
            label: "Count",
            value: String(v.attainmentLevels?.length ?? 0),
          },
        ],
      }),
    },
    {
      id: "review",
      title: "Review & submit",
      description: "Check everything before saving.",
      fields: <span />,
    },
  ];

  return (
    <div className={clsx(styles.builder, className)}>
      <MultiStepForm<AssessmentFormValues>
        steps={steps}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        serverError={error}
        success={loading ? false : undefined}
        submitLabel={isEditMode ? "Save changes" : "Create assessment"}
        ariaLabel="Assessment builder"
      />
      {onCancel && (
        <div className={styles.cancelRow}>
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
