import { forwardRef, useId } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";
import styles from "./Switch.module.scss";

export interface SwitchProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  inputSize?: "sm" | "md" | "lg";
  label?: ReactNode;
  name?: string;
  value?: string;
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      checked,
      defaultChecked = false,
      disabled = false,
      invalid = false,
      inputSize = "md",
      label,
      name,
      value,
      onCheckedChange,
      className,
      id,
      "aria-describedby": ariaDescribedBy,
      type = "button",
      onClick,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const switchId = id ?? generatedId;
    const isControlled = checked !== undefined;
    const isChecked = isControlled ? checked : defaultChecked;

    return (
      <label
        className={clsx(
          styles.container,
          styles[inputSize],
          disabled && styles.disabled,
          className,
        )}
        htmlFor={switchId}
      >
        <button
          ref={ref}
          id={switchId}
          type={type}
          role="switch"
          aria-checked={isChecked}
          aria-describedby={ariaDescribedBy}
          disabled={disabled}
          data-invalid={invalid || undefined}
          className={clsx(styles.switch, invalid && styles.invalid)}
          onClick={(event) => {
            onClick?.(event);
            if (!event.defaultPrevented && !disabled) {
              onCheckedChange?.(!isChecked);
            }
          }}
          {...props}
        >
          <span className={styles.thumb} aria-hidden="true" />
          {name && (
            <input
              type="checkbox"
              name={name}
              value={value}
              checked={isChecked}
              readOnly
              aria-hidden="true"
              tabIndex={-1}
              className={styles.hiddenInput}
            />
          )}
        </button>
        {label && <span className={styles.label}>{label}</span>}
      </label>
    );
  },
);

Switch.displayName = "Switch";
