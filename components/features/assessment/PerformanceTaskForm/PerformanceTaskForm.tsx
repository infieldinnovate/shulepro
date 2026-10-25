"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import type { FieldValues } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import clsx from "clsx";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { FormSection } from "@/components/shared/FormSection";
import { FormActions } from "@/components/shared/FormActions";
import { FormErrorSummary } from "@/components/shared/FormErrorSummary";
import type { FormErrorEntry } from "@/components/shared/FormErrorSummary";
import type { PerformanceTask } from "@/components/features/assessment/types";
import styles from "./PerformanceTaskForm.module.scss";

export interface PerformanceTaskFormData extends FieldValues {
  title: string;
  description: string;
  successCriteria: string[];
  evidenceRequirements: string;
  competencyRefs: string;
  timeLimit: string;
  rubricRef: string;
}

export interface PerformanceTaskFormProps {
  /** Existing task for edit mode. Omit for create mode. */
  task?: PerformanceTask;
  onSubmit: (data: PerformanceTask) => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  error?: ReactNode;
  className?: string;
}

function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function taskToDefaults(
  task?: PerformanceTask,
): PerformanceTaskFormData {
  if (!task) {
    return {
      title: "",
      description: "",
      successCriteria: [""],
      evidenceRequirements: "",
      competencyRefs: "",
      timeLimit: "",
      rubricRef: "",
    };
  }
  return {
    title: task.title,
    description: task.description,
    successCriteria:
      task.successCriteria.length > 0 ? [...task.successCriteria] : [""],
    evidenceRequirements: task.evidenceRequirements ?? "",
    competencyRefs: (task.competencyRefs ?? []).join(", "),
    timeLimit: task.timeLimit ?? "",
    rubricRef: task.rubricRef ?? "",
  };
}

export function PerformanceTaskForm({
  task,
  onSubmit,
  onCancel,
  loading = false,
  error,
  className,
}: PerformanceTaskFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PerformanceTaskFormData>({
    defaultValues: taskToDefaults(task),
    mode: "onTouched",
  });

  const [submitError, setSubmitError] = useState<ReactNode>(null);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "successCriteria",
  });

  const errorEntries: FormErrorEntry[] = [];
  if (errors.title) {
    errorEntries.push({ field: "title", fieldLabel: "Title", message: errors.title.message as string });
  }
  if (errors.description) {
    errorEntries.push({ field: "description", fieldLabel: "Description", message: errors.description.message as string });
  }

  const handleValidSubmit = (data: PerformanceTaskFormData) => {
    setSubmitError(null);
    const cleanCriteria = data.successCriteria
      .map((c) => c.trim())
      .filter((c) => c.length > 0);
    const result: PerformanceTask = {
      id: task?.id ?? generateId("task"),
      title: data.title,
      description: data.description,
      successCriteria: cleanCriteria,
      evidenceRequirements: data.evidenceRequirements || undefined,
      competencyRefs: data.competencyRefs
        ? data.competencyRefs
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined,
      timeLimit: data.timeLimit || undefined,
      rubricRef: data.rubricRef || undefined,
    };
    onSubmit(result);
  };

  const handleFormSubmit = () => {
    handleSubmit(handleValidSubmit)();
  };

  if (loading) {
    return (
      <div className={clsx(styles.container, className)}>
        <div className={styles.loadingState}>
          <Spinner size="md" label="Loading performance task form" />
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(styles.container, className)}>
      {(error || submitError) && (
        <Alert
          variant="error"
          title="Unable to save performance task"
          description={error ?? submitError}
        />
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
        title="Task details"
        description="Define what learners will do and how they will be assessed."
      >
        <FormField
          label="Title"
          required
          errorText={errors.title?.message as string | undefined}
          invalid={!!errors.title}
        >
          <Input
            id="title"
            {...register("title", { required: "Title is required" })}
            placeholder="e.g. Oral presentation on environmental conservation"
            invalid={!!errors.title}
          />
        </FormField>

        <FormField
          label="Description"
          required
          errorText={errors.description?.message as string | undefined}
          invalid={!!errors.description}
        >
          <Textarea
            id="description"
            {...register("description", {
              required: "Description is required",
            })}
            placeholder="Describe the task learners must complete..."
            rows={3}
            invalid={!!errors.description}
          />
        </FormField>

        <FormField
          label="Time limit"
          helperText="Optional — e.g. '30 minutes', '1 week'."
        >
          <Input
            id="timeLimit"
            {...register("timeLimit")}
            placeholder="e.g. 30 minutes"
          />
        </FormField>

        <FormField
          label="Linked rubric"
          helperText="Optional reference to a rubric id."
        >
          <Input
            id="rubricRef"
            {...register("rubricRef")}
            placeholder="Rubric reference"
          />
        </FormField>
      </FormSection>

      <FormSection
        title="Success criteria"
        description="What must learners demonstrate to complete the task successfully?"
      >
        <div className={styles.criteriaList}>
          {fields.map((field, index) => (
            <div key={field.id} className={styles.criteriaRow}>
              <Input
                {...register(`successCriteria.${index}` as const)}
                placeholder={`Success criterion ${index + 1}`}
                className={styles.criteriaInput}
              />
              <IconButton
                type="button"
                variant="ghost"
                size="sm"
                label={`Remove criterion ${index + 1}`}
                onClick={() => fields.length > 1 && remove(index)}
                disabled={fields.length === 1}
              >
                <Trash2 aria-hidden="true" />
              </IconButton>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          leftIcon={<Plus aria-hidden="true" />}
          onClick={() => append("")}
          className={styles.addCriteriaBtn}
        >
          Add criterion
        </Button>
      </FormSection>

      <FormSection
        title="Evidence and competencies"
        description="What evidence is required and which competencies are covered."
      >
        <FormField
          label="Evidence requirements"
          helperText="What evidence must learners submit?"
        >
          <Textarea
            id="evidenceRequirements"
            {...register("evidenceRequirements")}
            placeholder="e.g. Recorded presentation, written reflection, peer feedback form"
            rows={2}
          />
        </FormField>

        <FormField
          label="Competency references"
          helperText="Comma-separated competency or strand keys."
        >
          <Input
            id="competencyRefs"
            {...register("competencyRefs")}
            placeholder="e.g. communication, critical-thinking, environmental-awareness"
          />
        </FormField>
      </FormSection>

      <FormActions
        cancel={
          onCancel ? (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting || loading}
            >
              Cancel
            </Button>
          ) : undefined
        }
        submit={
          <Button
            type="button"
            onClick={handleFormSubmit}
            loading={isSubmitting || loading}
          >
            {task ? "Save changes" : "Create task"}
          </Button>
        }
      />
    </div>
  );
}
