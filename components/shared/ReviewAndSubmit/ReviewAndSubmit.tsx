"use client";

import type { ReactNode } from "react";
import { Pencil } from "lucide-react";
import clsx from "clsx";
import { FormActions } from "@/components/shared/FormActions";
import { Button } from "@/components/ui/Button";
import styles from "./ReviewAndSubmit.module.scss";

export interface ReviewSummaryField {
  label: ReactNode;
  value?: ReactNode;
  /** Text shown when value is empty/undefined. Defaults to "Not provided". */
  emptyText?: string;
}

export interface ReviewSummarySection {
  /** Zero-based index of the step this section summarises. */
  stepIndex: number;
  stepTitle: ReactNode;
  fields: ReviewSummaryField[];
}

export interface ReviewAndSubmitProps {
  summary: ReviewSummarySection[];
  /** Jump back to a step. Parent owns the navigation. */
  onEditStep: (index: number) => void;
  /** Fire the parent's submit. ReviewAndSubmit never submits on its own. */
  onSubmit: () => void;
  submitting?: boolean;
  submitLabel?: string;
  backLabel?: string;
  onBack?: () => void;
  title?: ReactNode;
  description?: ReactNode;
  /** Optional content rendered above the actions (e.g. confirmation checkbox). */
  children?: ReactNode;
  ariaLabel?: string;
  className?: string;
}

export function ReviewAndSubmit({
  summary,
  onEditStep,
  onSubmit,
  submitting = false,
  submitLabel = "Submit",
  backLabel = "Back",
  onBack,
  title = "Review and submit",
  description = "Check the details below before submitting.",
  children,
  ariaLabel = "Review summary",
  className,
}: ReviewAndSubmitProps) {
  return (
    <section className={className} aria-label={ariaLabel}>
      <div className={styles.container}>
        <div>
          <h2 className={styles.summaryTitle}>{title}</h2>
          {description && (
            <p className={styles.summaryDescription}>{description}</p>
          )}
        </div>

        <div className={styles.sections}>
          {summary.map((section) => {
            const editLabel =
              typeof section.stepTitle === "string"
                ? `Edit ${section.stepTitle}`
                : `Edit step ${section.stepIndex + 1}`;
            return (
              <div key={section.stepIndex} className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>{section.stepTitle}</h3>
                  <button
                    type="button"
                    className={styles.editButton}
                    onClick={() => onEditStep(section.stepIndex)}
                    aria-label={editLabel}
                  >
                    <Pencil aria-hidden="true" />
                    Edit
                  </button>
                </div>
                <ul className={styles.fieldList}>
                  {section.fields.map((field, idx) => {
                    const isEmpty = field.value == null || field.value === "";
                    return (
                      <li key={idx} className={styles.field}>
                        <span className={styles.fieldLabel}>{field.label}</span>
                        <span
                          className={clsx(
                            styles.fieldValue,
                            isEmpty && styles.emptyValue,
                          )}
                        >
                          {isEmpty
                            ? (field.emptyText ?? "Not provided")
                            : field.value}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>

        {children && <div className={styles.extra}>{children}</div>}

        <FormActions
          cancel={
            onBack ? (
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={submitting}
              >
                {backLabel}
              </Button>
            ) : undefined
          }
          submit={
            <Button
              type="button"
              onClick={onSubmit}
              loading={submitting}
              disabled={submitting}
            >
              {submitLabel}
            </Button>
          }
        />
      </div>
    </section>
  );
}
