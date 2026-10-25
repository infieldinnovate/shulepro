"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardList } from "lucide-react";
import clsx from "clsx";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import type { SelectOption } from "@/components/ui/Select";
import { RadioGroup } from "@/components/ui/RadioGroup";
import type { RadioOption } from "@/components/ui/RadioGroup";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { FormSection } from "@/components/shared/FormSection";
import { FormActions } from "@/components/shared/FormActions";
import { FormErrorSummary } from "@/components/shared/FormErrorSummary";
import type { FormErrorEntry } from "@/components/shared/FormErrorSummary";
import type {
  CareerAssessmentPrompt,
  CareerAssessmentFormValues,
} from "@/components/features/careers/types";
import styles from "./CareerAssessmentForm.module.scss";

export interface CareerAssessmentFormProps {
  /** Configurable prompts presented during the assessment. */
  prompts: CareerAssessmentPrompt[];
  /** Called with the assessment data on submit. Does NOT persist. */
  onSubmit: (values: CareerAssessmentFormValues) => void | Promise<void>;
  onCancel?: () => void;
  /** Optional title shown above the form. */
  title?: string;
  /** Optional description shown under the title. */
  description?: string;
  /** Pre-fill responses for editing (keyed by prompt id). */
  initialResponses?: Record<string, string>;
  initialNotes?: string;
  loading?: boolean;
  error?: ReactNode;
  className?: string;
}

function buildSchema(prompts: CareerAssessmentPrompt[]) {
  const requiredKeys = new Set(
    prompts.filter((p) => p.required).map((p) => p.id),
  );
  return z.object({
    responses: z
      .record(z.string(), z.string())
      .superRefine((value, ctx) => {
        for (const prompt of prompts) {
          const v = value[prompt.id] ?? "";
          if (v.length > 2000) {
            ctx.addIssue({
              code: "custom",
              path: [prompt.id],
              message: "Responses must be 2000 characters or fewer",
            });
          }
          if (requiredKeys.has(prompt.id) && v.trim().length === 0) {
            ctx.addIssue({
              code: "custom",
              path: [prompt.id],
              message: "This field is required",
            });
          }
        }
      }),
    notes: z.string().max(2000, "Notes must be 2000 characters or fewer"),
  });
}

function ratingToRadioOptions(
  prompt: CareerAssessmentPrompt,
): RadioOption[] {
  return (prompt.ratingOptions ?? []).map((opt) => ({
    value: opt.value,
    label: opt.shortLabel ?? opt.label,
    description: opt.description,
  }));
}

function choiceToSelectOptions(
  prompt: CareerAssessmentPrompt,
): SelectOption[] {
  return (prompt.choices ?? []).map((opt) => ({
    value: opt.value,
    label: opt.label,
  }));
}

export function CareerAssessmentForm({
  prompts,
  onSubmit,
  onCancel,
  title = "Career assessment",
  description,
  initialResponses,
  initialNotes,
  loading = false,
  error,
  className,
}: CareerAssessmentFormProps) {
  const [submitError, setSubmitError] = useState<ReactNode>(null);

  const schema = buildSchema(prompts);

  const defaultResponses: Record<string, string> = {};
  for (const prompt of prompts) {
    defaultResponses[prompt.id] = initialResponses?.[prompt.id] ?? "";
  }

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CareerAssessmentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      responses: defaultResponses,
      notes: initialNotes ?? "",
    },
    mode: "onTouched",
  });

  if (loading) {
    return (
      <div className={clsx(styles.container, className)}>
        <div className={styles.loadingState}>
          <Spinner size="md" label="Loading career assessment form" />
        </div>
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <div className={clsx(styles.container, className)}>
        <EmptyState
          icon={<ClipboardList aria-hidden="true" />}
          title="No assessment prompts"
          description="There are no career assessment prompts configured for this form."
        />
      </div>
    );
  }

  const responseErrors = errors.responses as
    | Record<string, { message?: string } | undefined>
    | undefined;

  const errorEntries: FormErrorEntry[] = [];

  if (responseErrors) {
    for (const [promptId, err] of Object.entries(responseErrors)) {
      if (err?.message) {
        const prompt = prompts.find((p) => p.id === promptId);
        errorEntries.push({
          field: promptId,
          fieldLabel: prompt?.question,
          message: err.message,
        });
      }
    }
  }
  if (errors.notes) {
    errorEntries.push({
      field: "notes",
      fieldLabel: "Notes",
      message: (errors.notes.message as string) ?? "Invalid value",
    });
  }

  const handleValidSubmit = (data: CareerAssessmentFormValues) => {
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
          title="Unable to save assessment"
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
          title="Assessment prompts"
          description="Respond to each prompt. Submitting captures the assessment data only — it does not persist automatically."
        >
          {prompts.map((prompt) => {
            const promptError = responseErrors?.[prompt.id]?.message;
            const invalid = Boolean(promptError);

            if (prompt.type === "rating") {
              return (
                <FormField
                  key={prompt.id}
                  label={prompt.question}
                  required={prompt.required}
                  helperText={prompt.helperText}
                  errorText={promptError as string | undefined}
                  invalid={invalid}
                >
                  <Controller
                    control={control}
                    name={`responses.${prompt.id}`}
                    render={({ field }) => (
                      <RadioGroup
                        id={prompt.id}
                        name={prompt.id}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        options={ratingToRadioOptions(prompt)}
                        layout="vertical"
                        invalid={invalid}
                        required={prompt.required}
                      />
                    )}
                  />
                </FormField>
              );
            }

            if (prompt.type === "choice") {
              return (
                <FormField
                  key={prompt.id}
                  label={prompt.question}
                  required={prompt.required}
                  helperText={prompt.helperText}
                  errorText={promptError as string | undefined}
                  invalid={invalid}
                >
                  <Select
                    id={prompt.id}
                    options={choiceToSelectOptions(prompt)}
                    placeholder="Select an option"
                    {...register(`responses.${prompt.id}`)}
                    invalid={invalid}
                  />
                </FormField>
              );
            }

            return (
              <FormField
                key={prompt.id}
                label={prompt.question}
                required={prompt.required}
                helperText={prompt.helperText}
                errorText={promptError as string | undefined}
                invalid={invalid}
              >
                <Textarea
                  id={prompt.id}
                  placeholder="Enter response..."
                  rows={3}
                  {...register(`responses.${prompt.id}`)}
                  invalid={invalid}
                />
              </FormField>
            );
          })}
        </FormSection>

        <FormSection title="Notes" variant="plain">
          <FormField
            label="Additional notes"
            helperText="Optional context about this career assessment."
            errorText={errors.notes?.message as string | undefined}
            invalid={!!errors.notes}
          >
            <Textarea
              id="notes"
              placeholder="Any additional context..."
              rows={3}
              {...register("notes")}
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
              Submit assessment
            </Button>
          }
        />
      </form>
    </div>
  );
}
