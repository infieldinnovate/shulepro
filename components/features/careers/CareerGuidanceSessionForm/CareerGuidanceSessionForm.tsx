"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, CalendarDays } from "lucide-react";
import clsx from "clsx";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import type { SelectOption } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Switch } from "@/components/ui/Switch";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { FormSection } from "@/components/shared/FormSection";
import { FormActions } from "@/components/shared/FormActions";
import { FormErrorSummary } from "@/components/shared/FormErrorSummary";
import type { FormErrorEntry } from "@/components/shared/FormErrorSummary";
import type {
  GuidanceSessionTypeOption,
  GuidanceDiscussionPromptOption,
  GuidanceSessionOutcomeOption,
  CareerGuidanceSessionFormValues,
} from "@/components/features/careers/types";
import styles from "./CareerGuidanceSessionForm.module.scss";

export interface CareerGuidanceSessionFormProps {
  /** Configurable session-type options. */
  sessionTypes: GuidanceSessionTypeOption[];
  /** Configurable discussion-prompt options. */
  discussionPrompts: GuidanceDiscussionPromptOption[];
  /** Configurable outcome labels. */
  outcomes: GuidanceSessionOutcomeOption[];
  /** Called with the session data on submit. Does NOT persist. */
  onSubmit: (values: CareerGuidanceSessionFormValues) => void | Promise<void>;
  onCancel?: () => void;
  /** Optional title shown above the form. */
  title?: string;
  /** Optional description shown under the title. */
  description?: string;
  /** Pre-fill values for editing. */
  initialValues?: Partial<CareerGuidanceSessionFormValues>;
  loading?: boolean;
  error?: ReactNode;
  className?: string;
}

const todayISO = () => new Date().toISOString().slice(0, 10);

function buildSchema() {
  return z.object({
    sessionDate: z
      .string()
      .min(1, "Session date is required"),
    learnerRef: z
      .string()
      .min(1, "Learner is required"),
    sessionType: z
      .string()
      .min(1, "Session type is required"),
    discussionPrompts: z
      .array(z.string())
      .superRefine((value, ctx) => {
        if (value.length === 0) {
          ctx.addIssue({
            code: "custom",
            path: ["discussionPrompts"],
            message: "Select at least one discussion prompt",
          });
        }
      }),
    notes: z
      .string()
      .max(5000, "Guidance notes must be 5000 characters or fewer"),
    nextSteps: z
      .array(
        z.object({
          id: z.string(),
          description: z
            .string()
            .min(1, "Next step description is required")
            .max(500, "Next step must be 500 characters or fewer"),
        }),
      ),
    outcome: z
      .string()
      .min(1, "Outcome is required"),
    followUp: z.boolean(),
  });
}

function toSelectOptions(
  options: { value: string; label: string }[],
): SelectOption[] {
  return options.map((opt) => ({ value: opt.value, label: opt.label }));
}

let nextStepIdCounter = 0;
function generateNextStepId(): string {
  nextStepIdCounter += 1;
  return `next-step-${Date.now()}-${nextStepIdCounter}`;
}

export function CareerGuidanceSessionForm({
  sessionTypes,
  discussionPrompts,
  outcomes,
  onSubmit,
  onCancel,
  title = "Career guidance session",
  description,
  initialValues,
  loading = false,
  error,
  className,
}: CareerGuidanceSessionFormProps) {
  const [submitError, setSubmitError] = useState<ReactNode>(null);

  const schema = buildSchema();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CareerGuidanceSessionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      sessionDate: initialValues?.sessionDate ?? todayISO(),
      learnerRef: initialValues?.learnerRef ?? "",
      sessionType: initialValues?.sessionType ?? "",
      discussionPrompts: initialValues?.discussionPrompts ?? [],
      notes: initialValues?.notes ?? "",
      nextSteps: initialValues?.nextSteps ?? [],
      outcome: initialValues?.outcome ?? "",
      followUp: initialValues?.followUp ?? false,
    },
    mode: "onTouched",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "nextSteps",
  });

  if (loading) {
    return (
      <div className={clsx(styles.container, className)}>
        <div className={styles.loadingState}>
          <Spinner size="md" label="Loading guidance session form" />
        </div>
      </div>
    );
  }

  if (sessionTypes.length === 0 && discussionPrompts.length === 0 && outcomes.length === 0) {
    return (
      <div className={clsx(styles.container, className)}>
        <EmptyState
          icon={<CalendarDays aria-hidden="true" />}
          title="No guidance session options"
          description="Session types, discussion prompts, and outcome labels must be configured before this form can be used."
        />
      </div>
    );
  }

  const errorEntries: FormErrorEntry[] = [];

  if (errors.sessionDate) {
    errorEntries.push({
      field: "sessionDate",
      fieldLabel: "Session date",
      message: (errors.sessionDate.message as string) ?? "Invalid date",
    });
  }
  if (errors.learnerRef) {
    errorEntries.push({
      field: "learnerRef",
      fieldLabel: "Learner",
      message: (errors.learnerRef.message as string) ?? "Invalid value",
    });
  }
  if (errors.sessionType) {
    errorEntries.push({
      field: "sessionType",
      fieldLabel: "Session type",
      message: (errors.sessionType.message as string) ?? "Invalid value",
    });
  }
  if (errors.discussionPrompts) {
    errorEntries.push({
      field: "discussionPrompts",
      fieldLabel: "Discussion prompts",
      message: (errors.discussionPrompts.message as string) ?? "Invalid selection",
    });
  }
  if (errors.notes) {
    errorEntries.push({
      field: "notes",
      fieldLabel: "Guidance notes",
      message: (errors.notes.message as string) ?? "Invalid value",
    });
  }
  if (errors.outcome) {
    errorEntries.push({
      field: "outcome",
      fieldLabel: "Outcome",
      message: (errors.outcome.message as string) ?? "Invalid value",
    });
  }
  const nextStepErrors = errors.nextSteps as
    | { message?: string }[]
    | undefined;
  if (nextStepErrors) {
    nextStepErrors.forEach((err, index) => {
      if (err?.message) {
        errorEntries.push({
          field: `nextSteps.${index}.description`,
          fieldLabel: `Next step ${index + 1}`,
          message: err.message,
        });
      }
    });
  }

  const handleValidSubmit = (data: CareerGuidanceSessionFormValues) => {
    setSubmitError(null);
    onSubmit(data);
  };

  const handleFormSubmit = () => {
    handleSubmit(handleValidSubmit)();
  };

  return (
    <div className={clsx(styles.container, className)}>
      {(error || submitError) && (
        <Alert
          variant="error"
          title="Unable to save guidance session"
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

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          handleFormSubmit();
        }}
      >
        {(title || description) && (
          <div className={styles.formHeader}>
            {title && <h3 className={styles.formTitle}>{title}</h3>}
            {description && (
              <p className={styles.formDescription}>{description}</p>
            )}
          </div>
        )}

        <FormSection
          title="Session details"
          description="Capture the basic details of this guidance session."
        >
          <div className={styles.detailGrid}>
            <FormField
              label="Session date"
              required
              errorText={errors.sessionDate?.message as string | undefined}
              invalid={!!errors.sessionDate}
            >
              <Input
                id="sessionDate"
                type="date"
                {...register("sessionDate")}
                invalid={!!errors.sessionDate}
              />
            </FormField>

            <FormField
              label="Learner"
              required
              helperText="Enter the learner's reference or ID."
              errorText={errors.learnerRef?.message as string | undefined}
              invalid={!!errors.learnerRef}
            >
              <Input
                id="learnerRef"
                placeholder="Learner reference"
                {...register("learnerRef")}
                invalid={!!errors.learnerRef}
              />
            </FormField>

            <FormField
              label="Session type"
              required
              errorText={errors.sessionType?.message as string | undefined}
              invalid={!!errors.sessionType}
            >
              <Select
                id="sessionType"
                options={toSelectOptions(sessionTypes)}
                placeholder="Select a session type"
                {...register("sessionType")}
                invalid={!!errors.sessionType}
              />
            </FormField>
          </div>
        </FormSection>

        <FormSection
          title="Discussion prompts"
          description="Select the topics discussed during this session."
        >
          <Controller
            control={control}
            name="discussionPrompts"
            render={({ field }) => (
              <div
                className={styles.promptGrid}
                role="group"
                aria-label="Discussion prompts"
              >
                {discussionPrompts.map((prompt) => {
                  const checked = field.value?.includes(prompt.value) ?? false;
                  return (
                    <Checkbox
                      key={prompt.value}
                      id={`prompt-${prompt.value}`}
                      label={prompt.label}
                      description={prompt.description}
                      checked={checked}
                      invalid={!!errors.discussionPrompts}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...(field.value ?? []), prompt.value]
                          : (field.value ?? []).filter(
                              (v: string) => v !== prompt.value,
                            );
                        field.onChange(next);
                      }}
                    />
                  );
                })}
              </div>
            )}
          />
          {errors.discussionPrompts && (
            <p className={styles.fieldError} role="alert">
              {errors.discussionPrompts.message as string}
            </p>
          )}
        </FormSection>

        <FormSection title="Guidance notes" variant="plain">
          <FormField
            label="Notes"
            helperText="Record what was discussed, observations, and any context."
            errorText={errors.notes?.message as string | undefined}
            invalid={!!errors.notes}
          >
            <Textarea
              id="notes"
              placeholder="Enter guidance notes..."
              rows={5}
              {...register("notes")}
              invalid={!!errors.notes}
            />
          </FormField>
        </FormSection>

        <FormSection
          title="Recommended next steps"
          description="Add actionable next steps for the learner."
        >
          <div className={styles.nextStepsList}>
            {fields.length === 0 && (
              <p className={styles.noNextSteps}>
                No next steps added yet.
              </p>
            )}
            {fields.map((field, index) => {
              const stepError = nextStepErrors?.[index]?.message;
              return (
                <div key={field.id} className={styles.nextStepRow}>
                  <FormField
                    label={`Next step ${index + 1}`}
                    errorText={stepError as string | undefined}
                    invalid={!!stepError}
                    className={styles.nextStepField}
                  >
                    <Input
                      id={`nextSteps.${index}.description`}
                      placeholder="Describe the next step..."
                      {...register(`nextSteps.${index}.description`)}
                      invalid={!!stepError}
                    />
                  </FormField>
                  <IconButton
                    type="button"
                    variant="ghost"
                    label={`Remove next step ${index + 1}`}
                    onClick={() => remove(index)}
                    disabled={isSubmitting}
                  >
                    <Trash2 aria-hidden="true" />
                  </IconButton>
                </div>
              );
            })}
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<Plus aria-hidden="true" />}
              onClick={() =>
                append({ id: generateNextStepId(), description: "" })
              }
              disabled={isSubmitting}
            >
              Add next step
            </Button>
          </div>
        </FormSection>

        <FormSection
          title="Outcome & follow-up"
          description="Record the session outcome and whether a follow-up is needed."
        >
          <div className={styles.outcomeRow}>
            <FormField
              label="Outcome"
              required
              errorText={errors.outcome?.message as string | undefined}
              invalid={!!errors.outcome}
              className={styles.outcomeField}
            >
              <Select
                id="outcome"
                options={toSelectOptions(outcomes)}
                placeholder="Select an outcome"
                {...register("outcome")}
                invalid={!!errors.outcome}
              />
            </FormField>

            <div className={styles.followUpField}>
              <Controller
                control={control}
                name="followUp"
                render={({ field }) => (
                  <Switch
                    id="followUp"
                    label="Follow-up needed"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>
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
              Save session
            </Button>
          }
        />
      </form>
    </div>
  );
}
