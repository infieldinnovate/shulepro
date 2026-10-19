import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { Check } from "lucide-react";
import clsx from "clsx";
import styles from "./RadioGroup.module.scss";

export interface RadioOption {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "onChange"> {
  name?: string;
  value?: string;
  defaultValue?: string;
  options: RadioOption[];
  legend?: ReactNode;
  helperText?: ReactNode;
  errorText?: ReactNode;
  invalid?: boolean;
  required?: boolean;
  layout?: "vertical" | "horizontal";
  inputSize?: "sm" | "md" | "lg";
  onChange?: (value: string) => void;
}

export const RadioGroup = forwardRef<HTMLFieldSetElement, RadioGroupProps>(
  (
    {
      name,
      value,
      defaultValue,
      options,
      legend,
      helperText,
      errorText,
      invalid = false,
      required = false,
      disabled = false,
      layout = "vertical",
      inputSize = "md",
      className,
      id,
      onChange,
    },
    ref,
  ) => {
    const generatedId = useId();
    const groupId = id ?? generatedId;
    const groupName = name ?? groupId;
    const helperId = helperText ? `${groupId}-helper` : undefined;
    const errorId = errorText ? `${groupId}-error` : undefined;
    const isInvalid = invalid || Boolean(errorText);
    const describedBy =
      [helperId, errorId].filter(Boolean).join(" ") || undefined;

    return (
      <fieldset
        ref={ref}
        className={clsx(styles.group, styles[layout], className)}
        aria-describedby={describedBy}
        aria-invalid={isInvalid || undefined}
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
        <div className={styles.options}>
          {options.map((option) => {
            const optionId = `${groupId}-${option.value}`;
            const descriptionId = option.description
              ? `${optionId}-desc`
              : undefined;
            const isOptionDisabled = disabled || option.disabled;
            const isChecked = value
              ? value === option.value
              : defaultValue
                ? defaultValue === option.value
                : undefined;

            return (
              <label
                key={option.value}
                className={clsx(
                  styles.container,
                  styles[inputSize],
                  isOptionDisabled && styles.disabled,
                )}
                htmlFor={optionId}
              >
                <span className={styles.control}>
                  <input
                    type="radio"
                    id={optionId}
                    name={groupName}
                    value={option.value}
                    checked={isChecked}
                    disabled={isOptionDisabled}
                    aria-describedby={descriptionId}
                    className={styles.input}
                    onChange={(event) => onChange?.(event.target.value)}
                  />
                  <span className={styles.box} aria-hidden="true">
                    <Check className={styles.mark} />
                  </span>
                </span>
                {(option.label || option.description) && (
                  <span className={styles.text}>
                    {option.label && (
                      <span className={styles.label}>{option.label}</span>
                    )}
                    {option.description && (
                      <span id={descriptionId} className={styles.description}>
                        {option.description}
                      </span>
                    )}
                  </span>
                )}
              </label>
            );
          })}
        </div>
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
  },
);

RadioGroup.displayName = "RadioGroup";
