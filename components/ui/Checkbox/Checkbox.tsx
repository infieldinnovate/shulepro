"use client";

import { forwardRef, useCallback, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { Check, Minus } from "lucide-react";
import clsx from "clsx";
import styles from "./Checkbox.module.scss";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  indeterminate?: boolean;
  invalid?: boolean;
  label?: ReactNode;
  description?: ReactNode;
  inputSize?: "sm" | "md" | "lg";
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      indeterminate = false,
      invalid = false,
      label,
      description,
      inputSize = "md",
      disabled,
      className,
      id,
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const descriptionId = description ? `${inputId}-desc` : undefined;

    const setCheckboxRef = useCallback(
      (node: HTMLInputElement | null) => {
        if (node) node.indeterminate = indeterminate;
        if (typeof ref === "function") ref(node);
        else if (ref)
          (ref as { current: HTMLInputElement | null }).current = node;
      },
      [indeterminate, ref],
    );

    return (
      <label
        className={clsx(
          styles.container,
          styles[inputSize],
          disabled && styles.disabled,
          className,
        )}
        htmlFor={inputId}
      >
        <span className={styles.control}>
          <input
            ref={setCheckboxRef}
            type="checkbox"
            id={inputId}
            disabled={disabled}
            aria-invalid={ariaInvalid ?? (invalid || undefined)}
            aria-describedby={
              ariaDescribedBy ?? (description ? descriptionId : undefined)
            }
            className={styles.input}
            {...props}
          />
          <span
            className={clsx(
              styles.box,
              invalid && styles.invalid,
              indeterminate && styles.indeterminate,
            )}
            aria-hidden="true"
          >
            {indeterminate ? (
              <Minus className={styles.mark} />
            ) : (
              <Check className={styles.mark} />
            )}
          </span>
        </span>
        {(label || description) && (
          <span className={styles.text}>
            {label && <span className={styles.label}>{label}</span>}
            {description && (
              <span id={descriptionId} className={styles.description}>
                {description}
              </span>
            )}
          </span>
        )}
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";
