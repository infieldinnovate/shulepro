"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import type { SelectOption } from "@/components/ui/Select";
import { RadioGroup } from "@/components/ui/RadioGroup";
import type { RadioOption } from "@/components/ui/RadioGroup";
import { DatePicker } from "@/components/ui/DatePicker";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { FormSection } from "@/components/shared/FormSection";
import { FormActions } from "@/components/shared/FormActions";
import { FormErrorSummary } from "@/components/shared/FormErrorSummary";
import type { FormErrorEntry } from "@/components/shared/FormErrorSummary";
import type {
  WellbeingPrompt,
  WellbeingCheckInFormValues,
} from "@/components/features/wellbeing/types";
import styles from "./WellbeingCheckInForm.module.scss";

export interface WellbeingCheckInFormProps {
  prompts: WellbeingPrompt[];
  onSubmit: (values: WellbeingCheckInFormValues) => void | Promise<void>;
  onCancel?: () => void;
  /** Pre-fill for editing. */
  initialDate?: Date | string;
  initialRecordedBy?: string;
  loading?: boolean;
  error?: ReactNode;
  className?: string;
}

function toDateInputValue(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
}

function buildSchema() {
  return z.object({
    date: z.string().min(1, "Check-in date is required"),
    responses: z.record(z.string(), z.string()),
    notes: z.string().max(2000, "Notes must be 2000 characters or fewer"),
    recordedBy: z
      .string()
      .max(200, "Recorded by must be 200 characters or fewer"),
  });
}

function ratingToRadioOptions(
  prompt: WellbeingPrompt,
): RadioOption[] {
  return (prompt.ratingOptions ?? []).map((opt) => ({
    value: opt.value,
    label: opt.label,
  }));
}

function choiceToSelectOptions(
  prompt: WellbeingPrompt,
): SelectOption[] {
  return (prompt.choices ?? []).map((opt) => ({
    value: opt.value,
    label: opt.label,
  }));
}

export function WellbeingCheckInForm({
  prompts,
  onSubmit,
  onCancel,
  initialDate,
  initialRecordedBy,
  loading = false,
  error,
  className,
}: WellbeingCheckInFormProps) {
  const today = new Date().toISOString().split("T")[0];
  const schema = buildSchema();

  const defaultResponses: Record<string, string> = {};
  for (const prompt of prompts) {
    defaultResponses[prompt.id] = "";
  }

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<WellbeingCheckInFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: initialDate ? toDateInputValue(initialDate) : today,
      responses: defaultResponses,
      notes: "",
      recordedBy: initialRecordedBy ?? "",
    },
    mode: "onTouched",
  });

  const [submitError, setSubmitError] = useState<ReactNode>(null);

  const responseErrors = errors.responses as
    | Record<string, { message?: string } | undefined>
    | undefined;

  const errorEntries: FormErrorEntry[] = [];

  if (errors.date) {
    errorEntries.push({
      field: "date",
      fieldLabel: "Check-in date",
      message: (errors.date.message as string) ?? "Invalid date",
    });
  }
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
  if (errors.recordedBy) {
    errorEntries.push({
      field: "recordedBy",
      fieldLabel: "Recorded by",
      message: (errors.recordedBy.message as string) ?? "Invalid value",
    });
  }

  const handleValidSubmit = (data: WellbeingCheckInFormValues) => {
    setSubmitError(null);
    onSubmit(data);
  };

  const handleFormSubmit = () => {
    handleSubmit(handleValidSubmit)();
  };

  if (loading) {
    return (
      <div className={clsx(styles.container, className)}>
        <div className={styles.loadingState}>
          <Spinner size="md" label="Loading check-in form" />
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(styles.container, className)}>
      {(error || submitError) && (
        <Alert
          variant="error"
          title="Unable to save check-in"
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
        <FormSection
          title="Check-in details"
          description="Record a wellbeing check-in. Use neutral, non-clinical language."
        >
          <FormField
            label="Check-in date"
            required
            errorText={errors.date?.message as string | undefined}
            invalid={!!errors.date}
          >
            <Controller
              control={control}
              name="date"
              render={({ field }) => (
                <DatePicker
                  id="date"
                  value={field.value ? new Date(field.value) : null}
                  onValueChange={(d) => {
                    field.onChange(d ? d.toISOString().split("T")[0] : "");
                  }}
                  invalid={!!errors.date}
                />
              )}
            />
          </FormField>

          <FormField
            label="Recorded by"
            helperText="Staff member recording this check-in."
            errorText={errors.recordedBy?.message as string | undefined}
            invalid={!!errors.recordedBy}
          >
            <Input
              id="recordedBy"
              placeholder="Enter name"
              {...register("recordedBy")}
              invalid={!!errors.recordedBy}
            />
          </FormField>
        </FormSection>

        {prompts.length > 0 && (
          <FormSection
            title="Check-in prompts"
            description="Respond to each prompt using non-stigmatizing language."
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
                      rules={
                        prompt.required
                          ? {
                              required: "This field is required",
                            }
                          : undefined
                      }
                      render={({ field }) => (
                        <RadioGroup
                          id={prompt.id}
                          name={prompt.id}
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          options={ratingToRadioOptions(prompt)}
                          layout="horizontal"
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
                      {...register(`responses.${prompt.id}`, {
                        required: prompt.required
                          ? "This field is required"
                          : false,
                      })}
                      invalid={invalid}
                    />
                  </FormField>
                );
              }

              // text prompt
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
                    {...register(`responses.${prompt.id}`, {
                      required: prompt.required
                        ? "This field is required"
                        : false,
                    })}
                    invalid={invalid}
                  />
                </FormField>
              );
            })}
          </FormSection>
        )}

        <FormSection title="Notes" variant="plain">
          <FormField
            label="Additional notes"
            helperText="Optional context (non-clinical)."
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
              Save check-in
            </Button>
          }
        />
      </form>
    </div>
  );
}
