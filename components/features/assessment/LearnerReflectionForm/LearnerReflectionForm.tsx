"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import type { FieldValues } from "react-hook-form";
import { Star } from "lucide-react";
import clsx from "clsx";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { RadioGroup } from "@/components/ui/RadioGroup";
import type { RadioOption } from "@/components/ui/RadioGroup";
import { Select } from "@/components/ui/Select";
import type { SelectOption } from "@/components/ui/Select";
import { FormSection } from "@/components/shared/FormSection";
import { FormActions } from "@/components/shared/FormActions";
import { FormErrorSummary } from "@/components/shared/FormErrorSummary";
import type { FormErrorEntry } from "@/components/shared/FormErrorSummary";
import type { ReflectionPrompt } from "@/components/features/assessment/types";
import styles from "./LearnerReflectionForm.module.scss";

export interface LearnerReflectionFormProps {
  prompts: ReflectionPrompt[];
  /** Called with responses keyed by prompt id. */
  onSubmit: (responses: Record<string, string | number>) => void;
  onCancel?: () => void;
  /** Pre-filled responses for edit mode. */
  initialResponses?: Record<string, string | number>;
  loading?: boolean;
  error?: ReactNode;
  className?: string;
}

interface ReflectionFormValues extends FieldValues {
  [key: string]: string | number;
}

function toInitialValues(
  prompts: ReflectionPrompt[],
  initial?: Record<string, string | number>,
): Record<string, string> {
  const values: Record<string, string> = {};
  for (const prompt of prompts) {
    const existing = initial?.[prompt.id];
    values[prompt.id] = existing != null ? String(existing) : "";
  }
  return values;
}

export function LearnerReflectionForm({
  prompts,
  onSubmit,
  onCancel,
  initialResponses,
  loading = false,
  error,
  className,
}: LearnerReflectionFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ReflectionFormValues>({
    defaultValues: toInitialValues(prompts, initialResponses),
    mode: "onTouched",
  });

  const [submitError] = useState<ReactNode>(null);

  if (loading) {
    return (
      <div className={clsx(styles.container, className)}>
        <div className={styles.loadingState}>
          <Spinner size="md" label="Loading reflection form" />
        </div>
      </div>
    );
  }

  const errorEntries: FormErrorEntry[] = prompts
    .filter((p) => p.required && errors[p.id])
    .map((p) => ({
      field: p.id,
      fieldLabel: p.question,
      message: errors[p.id]?.message as string,
    }));

  const handleValidSubmit = (data: ReflectionFormValues) => {
    const responses: Record<string, string | number> = {};
    for (const prompt of prompts) {
      const raw = data[prompt.id];
      if (prompt.type === "rating" && raw != null && raw !== "") {
        responses[prompt.id] = Number(raw);
      } else {
        responses[prompt.id] = raw ?? "";
      }
    }
    onSubmit(responses);
  };

  const handleFormSubmit = () => {
    handleSubmit(handleValidSubmit)();
  };

  return (
    <div className={clsx(styles.container, className)}>
      {(error || submitError) && (
        <Alert
          variant="error"
          title="Unable to submit reflection"
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
        title="Learner reflection"
        description="Share your thoughts on your learning progress."
      >
        <div className={styles.promptsList}>
          {prompts.map((prompt) => {
            const fieldName = prompt.id;
            const errorText = errors[fieldName]?.message as
              | string
              | undefined;

            if (prompt.type === "text") {
              return (
                <FormField
                  key={prompt.id}
                  label={prompt.question}
                  required={prompt.required}
                  errorText={errorText}
                  invalid={!!errors[fieldName]}
                >
                  <Textarea
                    id={prompt.id}
                    {...register(fieldName, {
                      required: prompt.required
                        ? "This question is required"
                        : false,
                    })}
                    placeholder="Write your reflection..."
                    rows={3}
                    invalid={!!errors[fieldName]}
                  />
                </FormField>
              );
            }

            if (prompt.type === "choice" && prompt.choices) {
              const options: SelectOption[] = prompt.choices.map((choice) => ({
                value: choice,
                label: choice,
              }));
              const currentValue = watch(fieldName) as string;
              return (
                <FormField
                  key={prompt.id}
                  label={prompt.question}
                  required={prompt.required}
                  errorText={errorText}
                  invalid={!!errors[fieldName]}
                >
                  <>
                    <Select
                      id={prompt.id}
                      options={options}
                      placeholder="Select an option..."
                      value={currentValue}
                      invalid={!!errors[fieldName]}
                      onChange={(e) => setValue(fieldName, e.target.value)}
                    />
                    <input
                      type="hidden"
                      {...register(fieldName, {
                        required: prompt.required
                          ? "Please select an option"
                          : false,
                      })}
                    />
                  </>
                </FormField>
              );
            }

            if (prompt.type === "rating") {
              const ratingOptions: RadioOption[] = [1, 2, 3, 4, 5].map(
                (n) => ({
                  value: String(n),
                  label: (
                    <span className={styles.ratingOption}>
                      {Array.from({ length: n }, (_, i) => (
                        <Star
                          key={i}
                          aria-hidden="true"
                          size={14}
                          fill="currentColor"
                        />
                      ))}
                      <span className={styles.ratingLabel}>{n}</span>
                    </span>
                  ),
                }),
              );
              const currentValue = watch(fieldName) as string;
              return (
                <FormField
                  key={prompt.id}
                  label={prompt.question}
                  required={prompt.required}
                  errorText={errorText}
                  invalid={!!errors[fieldName]}
                >
                  <>
                    <RadioGroup
                      name={prompt.id}
                      options={ratingOptions}
                      value={currentValue}
                      layout="horizontal"
                      required={prompt.required}
                      invalid={!!errors[fieldName]}
                      onChange={(value) => setValue(fieldName, value)}
                    />
                    <input
                      type="hidden"
                      {...register(fieldName, {
                        required: prompt.required
                          ? "Please select a rating"
                          : false,
                      })}
                    />
                  </>
                </FormField>
              );
            }

            return null;
          })}
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
            Submit reflection
          </Button>
        }
      />
    </div>
  );
}
