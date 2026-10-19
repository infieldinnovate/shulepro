import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";
import clsx from "clsx";
import styles from "./Textarea.module.scss";

export type TextareaSize = "sm" | "md" | "lg";
export type TextareaResize = "none" | "vertical" | "horizontal" | "auto";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  textareaSize?: TextareaSize;
  invalid?: boolean;
  resize?: TextareaResize;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      textareaSize = "md",
      invalid = false,
      resize = "vertical",
      disabled,
      className,
      "aria-invalid": ariaInvalid,
      ...props
    },
    ref,
  ) => {
    return (
      <textarea
        ref={ref}
        disabled={disabled}
        aria-invalid={ariaInvalid ?? (invalid || undefined)}
        data-resize={resize}
        className={clsx(
          styles.textarea,
          styles[textareaSize],
          styles[`resize-${resize}`],
          invalid && styles.invalid,
          disabled && styles.disabled,
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";
