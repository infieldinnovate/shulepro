"use client";

import { useId } from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import { CircleAlert as AlertCircle } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import styles from "./FormErrorSummary.module.scss";

export interface FormErrorEntry {
  /** Stable id of the field element to focus/anchor (e.g. "firstName"). */
  field?: string;
  /** Human-readable label for the field, shown before the message. */
  fieldLabel?: string;
  message: string;
}

export interface FormErrorSummaryProps {
  errors: FormErrorEntry[];
  title?: string;
  /** Accessible label for the summary region. */
  ariaLabel?: string;
  /** Focus the invalid field when an error link is activated. */
  onFocusField?: (fieldId: string) => void;
  className?: string;
}

export function FormErrorSummary({
  errors,
  title = "Please fix the following",
  ariaLabel = "Form errors",
  onFocusField,
  className,
}: FormErrorSummaryProps) {
  const generatedId = useId();
  const listId = `${generatedId}-list`;

  if (errors.length === 0) return null;

  const handleActivate = (
    event: KeyboardEvent<HTMLAnchorElement> | MouseEvent<HTMLAnchorElement>,
    field?: string,
  ) => {
    if (!field) return;
    // Allow plain anchor navigation for hash-based focus, but prefer
    // a programmatic callback when supplied by the parent form.
    if (onFocusField) {
      event.preventDefault();
      onFocusField(field);
    }
  };

  return (
    <Alert
      variant="error"
      icon={<AlertCircle aria-hidden="true" />}
      className={className}
      aria-label={ariaLabel}
    >
      <p className={styles.title}>{title}</p>
      <ul id={listId} className={styles.list} aria-label={ariaLabel}>
        {errors.map((entry, index) => {
          const key = entry.field ?? `error-${index}`;
          const labelPrefix = entry.fieldLabel
            ? `${entry.fieldLabel}: `
            : "";
          return (
            <li key={key} className={styles.item}>
              <span className={styles.bullet} aria-hidden="true" />
              {entry.field ? (
                <a
                  href={`#${entry.field}`}
                  className={styles.link}
                  onClick={(e) => handleActivate(e, entry.field)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleActivate(e, entry.field);
                  }}
                >
                  {labelPrefix}
                  {entry.message}
                </a>
              ) : (
                <span className={styles.text}>
                  {labelPrefix}
                  {entry.message}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </Alert>
  );
}
