import { cloneElement, isValidElement, useId } from "react";
import type { ReactElement, ReactNode } from "react";
import clsx from "clsx";
import { Label } from "../Label";
import styles from "./FormField.module.scss";

export interface FormFieldProps {
  label?: ReactNode;
  htmlFor?: string;
  required?: boolean;
  disabled?: boolean;
  helperText?: ReactNode;
  errorText?: ReactNode;
  invalid?: boolean;
  /**
   * The form control element (Input, Textarea, Select, etc.).
   * FormField injects id, aria-describedby, and aria-invalid.
   */
  children: ReactElement;
  className?: string;
  labelClassName?: string;
}

export function FormField({
  label,
  htmlFor,
  required = false,
  disabled = false,
  helperText,
  errorText,
  invalid = false,
  children,
  className,
  labelClassName,
}: FormFieldProps) {
  const generatedId = useId();
  const fieldId = htmlFor ?? generatedId;
  const helperId = helperText ? `${fieldId}-helper` : undefined;
  const errorId = errorText ? `${fieldId}-error` : undefined;
  const describedBy =
    [helperId, errorId].filter(Boolean).join(" ") || undefined;
  const isInvalid = invalid || Boolean(errorText);

  type ControlProps = {
    id?: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean | "true" | "false";
  };

  const control = isValidElement<ControlProps>(children)
    ? cloneElement(children, {
        id: children.props.id ?? fieldId,
        "aria-describedby": children.props["aria-describedby"] ?? describedBy,
        "aria-invalid": children.props["aria-invalid"] ?? (isInvalid || undefined),
      })
    : children;

  return (
    <div
      className={clsx(styles.field, isInvalid && styles.invalid, className)}
    >
      {label && (
        <Label
          htmlFor={fieldId}
          required={required}
          disabled={disabled}
          className={labelClassName}
        >
          {label}
        </Label>
      )}
      {control}
      {helperText && !isInvalid && (
        <p id={helperId} className={styles.helper}>
          {helperText}
        </p>
      )}
      {isInvalid && errorText && (
        <p id={errorId} className={styles.error} role="alert">
          {errorText}
        </p>
      )}
    </div>
  );
}
