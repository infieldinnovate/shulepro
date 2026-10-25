"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { Checkbox } from "@/components/ui/Checkbox";
import { Textarea } from "@/components/ui/Textarea";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { FormSection } from "@/components/shared/FormSection";
import { FormActions } from "@/components/shared/FormActions";
import { FormErrorSummary } from "@/components/shared/FormErrorSummary";
import type { FormErrorEntry } from "@/components/shared/FormErrorSummary";
import type {
  LearningAreaChoiceOption,
  LearningAreaChoiceRules,
  LearningAreaChoiceFormValues,
} from "@/components/features/careers/types";
import styles from "./LearningAreaChoiceForm.module.scss";

export interface LearningAreaChoiceFormProps {
  /** Configurable learning-area options to choose from. */
  options: LearningAreaChoiceOption[];
  /** Configurable selection rules (min/max selections, ranking). */
  rules: LearningAreaChoiceRules;
  /** Called with the selections on submit. Does NOT persist. */
  onSubmit: (values: LearningAreaChoiceFormValues) => void | Promise<void>;
  onCancel?: () => void;
  /** Optional title shown above the form. */
  title?: string;
  /** Optional description shown under the title. */
  description?: string;
  /** Pre-fill selections for editing. */
  initialSelections?: string[];
  initialRationale?: string;
  loading?: boolean;
  error?: ReactNode;
  className?: string;
}

function buildSchema(rules: LearningAreaChoiceRules) {
  return z.object({
    selections: z
      .array(z.string())
      .superRefine((value, ctx) => {
        if (rules.minSelections != null && value.length < rules.minSelections) {
          ctx.addIssue({
            code: "custom",
            path: ["selections"],
            message: `Select at least ${rules.minSelections} learning area${rules.minSelections === 1 ? "" : "s"}.`,
          });
        }
        if (
          rules.maxSelections != null &&
          rules.maxSelections > 0 &&
          value.length > rules.maxSelections
        ) {
          ctx.addIssue({
            code: "custom",
            path: ["selections"],
            message: `Select at most ${rules.maxSelections} learning area${rules.maxSelections === 1 ? "" : "s"}.`,
          });
        }
      }),
    rationale: z
      .string()
      .max(2000, "Rationale must be 2000 characters or fewer")
      .optional()
      .or(z.literal("")),
  });
}

export function LearningAreaChoiceForm({
  options,
  rules,
  onSubmit,
  onCancel,
  title = "Learning area choices",
  description,
  initialSelections,
  initialRationale,
  loading = false,
  error,
  className,
}: LearningAreaChoiceFormProps) {
  const [submitError, setSubmitError] = useState<ReactNode>(null);

  const schema = buildSchema(rules);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LearningAreaChoiceFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      selections: initialSelections ?? [],
      rationale: initialRationale ?? "",
    },
    mode: "onTouched",
  });

  const selectedValues = watch("selections") as string[];
  const maxReached =
    rules.maxSelections != null &&
    rules.maxSelections > 0 &&
    selectedValues.length >= rules.maxSelections;

  const errorEntries: FormErrorEntry[] = [];

  if (errors.selections) {
    errorEntries.push({
      field: "selections",
      fieldLabel: "Learning area selections",
      message: (errors.selections.message as string) ?? "Invalid selection",
    });
  }
  if (errors.rationale) {
    errorEntries.push({
      field: "rationale",
      fieldLabel: "Rationale",
      message: (errors.rationale.message as string) ?? "Invalid value",
    });
  }

  const handleValidSubmit = (data: LearningAreaChoiceFormValues) => {
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
          <Spinner size="md" label="Loading learning area choice form" />
        </div>
      </div>
    );
  }

  const helperText =
    rules.minSelections != null || rules.maxSelections != null
      ? `Select ${rules.minSelections != null ? `at least ${rules.minSelections}` : "any"}${
          rules.maxSelections != null && rules.maxSelections > 0
            ? ` and at most ${rules.maxSelections}`
            : ""
        } learning area${rules.maxSelections === 1 ? "" : "s"}.`
      : undefined;

  return (
    <div className={clsx(styles.container, className)}>
      {(error || submitError) && (
        <Alert
          variant="error"
          title="Unable to save learning area choices"
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
          title="Learning area selections"
          description={helperText ?? "Choose the learning areas you wish to pursue."}
        >
          <Controller
            control={control}
            name="selections"
            render={({ field }) => (
              <div
                className={styles.optionGrid}
                role="group"
                aria-label="Learning area options"
              >
                {options.map((option) => {
                  const checked = field.value?.includes(option.value) ?? false;
                  const disabled = option.disabled || (!checked && maxReached);
                  return (
                    <Checkbox
                      key={option.value}
                      id={`option-${option.value}`}
                      label={option.label}
                      description={option.description}
                      checked={checked}
                      disabled={disabled}
                      invalid={!!errors.selections}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...(field.value ?? []), option.value]
                          : (field.value ?? []).filter(
                              (v: string) => v !== option.value,
                            );
                        field.onChange(next);
                      }}
                    />
                  );
                })}
              </div>
            )}
          />
          {errors.selections && (
            <p className={styles.selectionError} role="alert">
              {errors.selections.message as string}
            </p>
          )}
        </FormSection>

        <FormSection title="Rationale" variant="plain">
          <FormField
            label="Why these choices?"
            helperText="Optional explanation of your learning area selections."
            errorText={errors.rationale?.message as string | undefined}
            invalid={!!errors.rationale}
          >
            <Textarea
              id="rationale"
              placeholder="Explain your reasoning..."
              rows={3}
              {...register("rationale")}
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
              Submit choices
            </Button>
          }
        />
      </form>
    </div>
  );
}
