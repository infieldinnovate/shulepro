"use client";

import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  useForm,
  FormProvider,
  type DefaultValues,
  type FieldValues,
  type SubmitHandler,
} from "react-hook-form";
import type { ZodType, ZodIssue } from "zod";
import clsx from "clsx";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { FormActions } from "@/components/shared/FormActions";
import { FormErrorSummary } from "@/components/shared/FormErrorSummary";
import type { FormErrorEntry } from "@/components/shared/FormErrorSummary";
import { StepIndicator } from "@/components/shared/StepIndicator";
import type { StepStatus } from "@/components/shared/StepIndicator";
import { ReviewAndSubmit } from "@/components/shared/ReviewAndSubmit";
import type { ReviewSummarySection } from "@/components/shared/ReviewAndSubmit";
import styles from "./MultiStepForm.module.scss";

export type StepDirection = "next" | "back" | "jump";

export interface MultiStepFormStep<T extends FieldValues> {
  id: string;
  title?: ReactNode;
  description?: ReactNode;
  /**
   * Optional Zod schema describing the full form shape. When present,
   * only the fields this schema references are validated before
   * advancing. A step without a schema advances without validation.
   */
  schema?: ZodType<T>;
  /** Field content for the step. Receives the active step index. */
  fields: ReactNode | ((context: { index: number }) => ReactNode);
  /**
   * Build the review summary section for this step. Returned section
   * must include `stepIndex` (the parent fills it when omitted).
   */
  buildSummary?: (values: T) => Omit<ReviewSummarySection, "stepIndex"> | undefined;
}

export interface MultiStepFormProps<T extends FieldValues> {
  steps: MultiStepFormStep<T>[];
  defaultValues: DefaultValues<T>;
  onSubmit: SubmitHandler<T>;
  /** Build the review summary from the final values. Overrides per-step buildSummary. */
  buildSummary?: (values: T) => ReviewSummarySection[];
  onStepChange?: (index: number, direction: StepDirection) => void;
  submitLabel?: string;
  backLabel?: string;
  nextLabel?: string;
  /** Server-side error message rendered above the actions of the active step. */
  serverError?: ReactNode;
  /** Show a success state in place of the form. */
  success?: boolean;
  successTitle?: ReactNode;
  successDescription?: ReactNode;
  onResetSuccess?: () => void;
  resetLabel?: string;
  ariaLabel?: string;
  className?: string;
}

function zodIssueMessage(error: unknown): string | null {
  if (error && typeof error === "object" && "issues" in error) {
    const issues = (error as { issues: ZodIssue[] }).issues;
    if (Array.isArray(issues) && issues.length > 0) {
      return issues[0].message;
    }
  }
  return null;
}

export function MultiStepForm<T extends FieldValues>({
  steps,
  defaultValues,
  onSubmit,
  buildSummary,
  onStepChange,
  submitLabel = "Submit",
  backLabel = "Back",
  nextLabel = "Next",
  serverError,
  success = false,
  successTitle = "Submitted",
  successDescription = "Your form was submitted successfully.",
  onResetSuccess,
  resetLabel = "Submit another",
  ariaLabel = "Multi-step form",
  className,
}: MultiStepFormProps<T>) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<ReactNode>(null);

  const form = useForm<T>({
    defaultValues,
    mode: "onTouched",
  });

  const { handleSubmit, trigger, formState, getValues, setError, clearErrors } =
    form;

  const lastIndex = steps.length - 1;
  const isReviewStep = currentIndex === lastIndex && lastIndex > 0;

  const indicatorSteps = useMemo(
    () =>
      steps.map((step, index) => {
        let status: StepStatus = "pending";
        if (index < currentIndex) status = "completed";
        else if (index === currentIndex) status = "current";
        return {
          id: step.id,
          label: step.title ?? `Step ${index + 1}`,
          description: step.description,
          status,
        };
      }),
    [steps, currentIndex],
  );

  const goTo = useCallback(
    (next: number, direction: StepDirection) => {
      const clamped = Math.min(Math.max(next, 0), lastIndex);
      if (clamped === currentIndex) return;
      setCurrentIndex(clamped);
      onStepChange?.(clamped, direction);
    },
    [currentIndex, lastIndex, onStepChange],
  );

  const validateStep = useCallback(
    async (step: MultiStepFormStep<T>): Promise<boolean> => {
      if (!step.schema) {
        clearErrors();
        return true;
      }
      const values = getValues();
      const result = step.schema.safeParse(values);
      if (result.success) {
        clearErrors();
        return true;
      }
      // Surface schema errors into RHF so the error summary and field
      // invalid states render consistently.
      const issues = result.error.issues;
      issues.forEach((issue) => {
        const field = issue.path.length > 0 ? issue.path.join(".") : "root";
        setError(field as never, {
          type: "zod",
          message: issue.message,
        });
      });
      return false;
    },
    [clearErrors, getValues, setError],
  );

  const handleNext = useCallback(async () => {
    const step = steps[currentIndex];
    if (!step) return;
    // Also run RHF's own trigger so touched/dirty state is correct for
    // registered fields the schema may not cover.
    await trigger(undefined, { shouldFocus: true });
    const valid = await validateStep(step);
    if (!valid) return;
    if (currentIndex < lastIndex) {
      goTo(currentIndex + 1, "next");
    }
  }, [steps, currentIndex, trigger, validateStep, lastIndex, goTo]);

  const handleBack = useCallback(() => {
    if (currentIndex > 0) goTo(currentIndex - 1, "back");
  }, [currentIndex, goTo]);

  const handleEditStep = useCallback(
    (index: number) => {
      goTo(index, "jump");
    },
    [goTo],
  );

  const handleFinalSubmit = useCallback(() => {
    setSubmitError(null);
    setSubmitting(true);
    handleSubmit(async (values) => {
      try {
        await onSubmit(values);
      } catch (error) {
        const fallback =
          error instanceof Error ? error.message : "Submission failed.";
        setSubmitError(zodIssueMessage(error) ?? fallback);
        setSubmitting(false);
      }
    })();
  }, [handleSubmit, onSubmit]);

  const summarySections = useMemo<ReviewSummarySection[]>(() => {
    if (buildSummary) return buildSummary(getValues() as T);
    return steps
      .map((step, index) => {
        const section = step.buildSummary?.(getValues() as T);
        if (!section) return undefined;
        return { ...section, stepIndex: index };
      })
      .filter((s): s is ReviewSummarySection => s != null);
  }, [buildSummary, steps, getValues]);

  const errorEntries: FormErrorEntry[] = useMemo(
    () =>
      Object.entries(formState.errors).map(([field, error]) => ({
        field,
        message: (error?.message as string) ?? "Invalid value",
      })),
    [formState.errors],
  );

  if (success) {
    return (
      <div className={clsx(styles.container, className)}>
        <div className={styles.success}>
          <Alert
            variant="success"
            title={successTitle}
            description={successDescription}
          />
          {onResetSuccess && (
            <FormActions
              start={
                <Button
                  type="button"
                  variant="outline"
                  onClick={onResetSuccess}
                >
                  {resetLabel}
                </Button>
              }
            />
          )}
        </div>
      </div>
    );
  }

  const currentStep = steps[currentIndex];

  return (
    <FormProvider {...form}>
      <div className={clsx(styles.container, className)}>
        <StepIndicator
          steps={indicatorSteps}
          onStepClick={(index) => {
            // Only allow jumping back to completed steps from the review
            // screen or earlier steps; never forward without validation.
            if (index < currentIndex) handleEditStep(index);
          }}
          ariaLabel={ariaLabel}
        />

        {!isReviewStep && (
          <div className={styles.body}>
            <div className={styles.stepHeader}>
              {currentStep?.title && (
                <h2 className={styles.stepTitle}>{currentStep.title}</h2>
              )}
              {currentStep?.description && (
                <p className={styles.stepDescription}>
                  {currentStep.description}
                </p>
              )}
            </div>

            <form
              className={styles.form}
              onSubmit={(e) => {
                e.preventDefault();
                handleNext();
              }}
            >
              {(serverError || submitError) && (
                <Alert variant="error" className={styles.alert}>
                  {serverError ?? submitError}
                </Alert>
              )}
              {errorEntries.length > 0 && (
                <FormErrorSummary
                  errors={errorEntries}
                  onFocusField={(fieldId) => {
                    const el = document.getElementById(fieldId);
                    el?.focus();
                  }}
                  className={styles.alert}
                />
              )}
              <div className={styles.fields}>
                {typeof currentStep?.fields === "function"
                  ? currentStep.fields({ index: currentIndex })
                  : currentStep?.fields}
              </div>

              <FormActions
                cancel={
                  currentIndex > 0 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      disabled={submitting}
                    >
                      {backLabel}
                    </Button>
                  ) : undefined
                }
                submit={
                  <Button type="submit">
                    {currentIndex === lastIndex - 1 ? "Review" : nextLabel}
                  </Button>
                }
                className={styles.actions}
              />
            </form>
          </div>
        )}

        {isReviewStep && (
          <ReviewAndSubmit
            summary={summarySections}
            onEditStep={handleEditStep}
            onSubmit={handleFinalSubmit}
            submitting={submitting}
            submitLabel={submitLabel}
            backLabel={backLabel}
            onBack={handleBack}
          />
        )}
      </div>
    </FormProvider>
  );
}
