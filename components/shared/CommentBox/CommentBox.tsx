"use client";

import { useId, useState } from "react";
import type { ReactNode } from "react";
import { Send } from "lucide-react";
import clsx from "clsx";
import { Textarea } from "../../ui/Textarea";
import { Button } from "../../ui/Button";
import { FormActions } from "../FormActions";
import styles from "./CommentBox.module.scss";

export interface CommentBoxProps {
  onSubmit: (text: string) => void;
  placeholder?: string;
  submitting?: boolean;
  disabled?: boolean;
  maxLength?: number;
  helperText?: ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
  /** When provided, shows a cancel/clear button that clears local text. */
  onCancel?: () => void;
  /** Optional label above the textarea. */
  label?: ReactNode;
  ariaLabel?: string;
  className?: string;
  /** Initial text value (uncontrolled). */
  defaultValue?: string;
}

export function CommentBox({
  onSubmit,
  placeholder = "Write a comment\u2026",
  submitting = false,
  disabled = false,
  maxLength,
  helperText,
  submitLabel = "Comment",
  cancelLabel = "Cancel",
  onCancel,
  label,
  ariaLabel = "Add comment",
  className,
  defaultValue = "",
}: CommentBoxProps) {
  const generatedId = useId();
  const textareaId = `${generatedId}-textarea`;
  const countId = `${generatedId}-count`;

  const [text, setText] = useState(defaultValue);
  const [attempted, setAttempted] = useState(false);

  const trimmed = text.trim();
  const isEmpty = trimmed.length === 0;
  const overLimit =
    typeof maxLength === "number" && text.length > maxLength;
  const canSubmit = !disabled && !submitting && !isEmpty && !overLimit;

  const remaining =
    typeof maxLength === "number" ? maxLength - text.length : undefined;

  const handleSubmit = () => {
    setAttempted(true);
    if (!canSubmit) return;
    onSubmit(trimmed);
    setText("");
    setAttempted(false);
  };

  const handleCancel = () => {
    setText("");
    setAttempted(false);
    onCancel?.();
  };

  const isInvalid = (attempted && isEmpty) || overLimit;

  return (
    <div
      className={clsx(styles.container, className)}
      aria-label={ariaLabel}
    >
      {label && (
        <label htmlFor={textareaId} className={styles.label}>
          {label}
        </label>
      )}

      <Textarea
        id={textareaId}
        value={text}
        placeholder={placeholder}
        disabled={disabled || submitting}
        invalid={isInvalid}
        resize="vertical"
        textareaSize="md"
        maxLength={maxLength}
        aria-describedby={
          typeof remaining === "number" ? countId : undefined
        }
        onChange={(e) => setText(e.target.value)}
        className={styles.textarea}
      />

      <div className={styles.meta}>
        {helperText && !isInvalid && (
          <p className={styles.helper}>{helperText}</p>
        )}
        {attempted && isEmpty && (
          <p className={styles.error} role="alert">
            Comment cannot be empty.
          </p>
        )}
        {overLimit && (
          <p className={styles.error} role="alert">
            Comment exceeds the {maxLength} character limit.
          </p>
        )}
        {typeof remaining === "number" && (
          <p
            id={countId}
            className={clsx(styles.count, remaining < 0 && styles.countOver)}
            aria-live="polite"
          >
            {text.length}/{maxLength}
          </p>
        )}
      </div>

      <FormActions
        align="end"
        stretchMobile
        cancel={
          onCancel ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={disabled || submitting}
            >
              {cancelLabel}
            </Button>
          ) : undefined
        }
        submit={
          <Button
            type="button"
            onClick={handleSubmit}
            loading={submitting}
            disabled={disabled || submitting || (attempted && !canSubmit)}
            leftIcon={<Send aria-hidden="true" />}
          >
            {submitLabel}
          </Button>
        }
        className={styles.actions}
      />
    </div>
  );
}
