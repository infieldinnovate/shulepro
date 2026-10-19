import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";
import styles from "./Input.module.scss";

export type InputSize = "sm" | "md" | "lg";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  inputSize?: InputSize;
  invalid?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      inputSize = "md",
      invalid = false,
      leadingIcon,
      trailingIcon,
      disabled,
      className,
      type = "text",
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
      id,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div
        className={clsx(
          styles.wrapper,
          styles[inputSize],
          invalid && styles.invalid,
          disabled && styles.disabled,
          className,
        )}
      >
        {leadingIcon && (
          <span className={styles.leadingIcon} aria-hidden="true">
            {leadingIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          aria-invalid={ariaInvalid ?? (invalid || undefined)}
          aria-describedby={ariaDescribedBy}
          className={styles.input}
          {...props}
        />
        {trailingIcon && (
          <span className={styles.trailingIcon} aria-hidden="true">
            {trailingIcon}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
