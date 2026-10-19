import type { LabelHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";
import styles from "./Label.module.scss";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  disabled?: boolean;
  children?: ReactNode;
}

export function Label({
  required = false,
  disabled = false,
  className,
  children,
  htmlFor,
  ...props
}: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={clsx(
        styles.label,
        required && styles.required,
        disabled && styles.disabled,
        className,
      )}
      {...props}
    >
      {children}
      {required && (
        <span className={styles.requiredMark} aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}
