import { forwardRef, useId } from "react";
import type { SelectHTMLAttributes, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import styles from "./Select.module.scss";

export type SelectSize = "sm" | "md" | "lg";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  selectSize?: SelectSize;
  invalid?: boolean;
  options?: SelectOption[];
  placeholder?: string;
  leadingIcon?: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      selectSize = "md",
      invalid = false,
      options,
      placeholder,
      leadingIcon,
      disabled,
      className,
      id,
      children,
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;

    return (
      <div
        className={clsx(
          styles.wrapper,
          styles[selectSize],
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
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          aria-invalid={ariaInvalid ?? (invalid || undefined)}
          aria-describedby={ariaDescribedBy}
          className={styles.select}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options
            ? options.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </option>
              ))
            : children}
        </select>
        <ChevronDown className={styles.chevron} aria-hidden="true" />
      </div>
    );
  },
);

Select.displayName = "Select";
