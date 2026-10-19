import type { ReactNode } from "react";
import { useId } from "react";
import clsx from "clsx";
import styles from "./CheckboxGroup.module.scss";

export interface CheckboxGroupProps {
  legend?: ReactNode;
  helperText?: ReactNode;
  errorText?: ReactNode;
  invalid?: boolean;
  required?: boolean;
  disabled?: boolean;
  layout?: "vertical" | "horizontal";
  className?: string;
  children: ReactNode;
}

export function CheckboxGroup({
  legend,
  helperText,
  errorText,
  invalid = false,
  required = false,
  disabled = false,
  layout = "vertical",
  className,
  children,
}: CheckboxGroupProps) {
  const groupId = useId();
  const helperId = helperText ? `${groupId}-helper` : undefined;
  const errorId = errorText ? `${groupId}-error` : undefined;
  const isInvalid = invalid || Boolean(errorText);
  const describedBy =
    [helperId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <fieldset
      className={clsx(styles.group, styles[layout], className)}
      aria-describedby={describedBy}
      aria-invalid={isInvalid || undefined}
      disabled={disabled}
    >
      {legend && (
        <legend className={styles.legend}>
          {legend}
          {required && (
            <span className={styles.requiredMark} aria-hidden="true">
              *
            </span>
          )}
        </legend>
      )}
      <div className={styles.options}>{children}</div>
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
    </fieldset>
  );
}
