"use client";

import { useId } from "react";
import type { ReactNode } from "react";
import { FormProvider, useFormContext, type UseFormReturn } from "react-hook-form";
import { Dialog } from "../../ui/Dialog";
import type { DialogSize } from "../../ui/Dialog";
import { Button } from "../../ui/Button";
import { Alert } from "../../ui/Alert";
import { FormActions } from "../FormActions";
import { FormErrorSummary } from "../FormErrorSummary";
import type { FormErrorEntry } from "../FormErrorSummary";
import styles from "./FormDialog.module.scss";

export interface FormDialogProps<T extends Record<string, unknown>> {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  /** React Hook Form instance owning the form state. */
  form: UseFormReturn<T>;
  /** Called with validated values on submit. */
  onSubmit: (values: T) => void | Promise<void>;
  /** Optional override for the submitting state (defaults to form.formState.isSubmitting). */
  submitting?: boolean;
  /** Optional override for the submit button label. */
  submitLabel?: string;
  cancelLabel?: string;
  /** Optional server-side error message rendered above the actions. */
  serverError?: ReactNode;
  /** Dialog size. Defaults to "md". */
  size?: DialogSize;
  /** Show the top-right close button. Defaults to true. */
  showCloseButton?: boolean;
  /** Close when the overlay backdrop is clicked. Defaults to false to avoid accidental data loss. */
  closeOnOverlayClick?: boolean;
  ariaLabel?: string;
  className?: string;
  bodyClassName?: string;
  footerClassName?: string;
  children?: ReactNode;
  /** Extra actions rendered on the inline-start side of the footer. */
  secondary?: ReactNode;
}

export function FormDialog<T extends Record<string, unknown>>({
  open,
  onClose,
  title,
  description,
  form,
  onSubmit,
  submitting,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  serverError,
  size = "md",
  showCloseButton = true,
  closeOnOverlayClick = false,
  ariaLabel,
  className,
  bodyClassName,
  footerClassName,
  children,
  secondary,
}: FormDialogProps<T>) {
  const { handleSubmit, formState } = form;
  const isSubmitting = submitting ?? formState.isSubmitting;
  const generatedFormId = useId();
  const formId = `form-dialog-${generatedFormId}`;

  // Collect field errors into summary entries.
  const errorEntries: FormErrorEntry[] = Object.entries(formState.errors).map(
    ([field, error]) => ({
      field,
      message: (error?.message as string) ?? "Invalid value",
    }),
  );

  return (
    <FormProvider {...form}>
      <Dialog
        open={open}
        onClose={onClose}
        title={title}
        description={description}
        size={size}
        showCloseButton={showCloseButton}
        closeOnOverlayClick={closeOnOverlayClick}
        ariaLabel={ariaLabel}
        className={className}
        bodyClassName={bodyClassName}
        footerClassName={footerClassName}
        footer={
          <FormActions
            submit={
              <Button
                type="submit"
                form={formId}
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {submitLabel}
              </Button>
            }
            cancel={
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                {cancelLabel}
              </Button>
            }
            secondary={secondary}
            className={styles.actions}
          />
        }
      >
        <form
          id={formId}
          className={styles.form}
          onSubmit={handleSubmit(onSubmit)}
        >
          {serverError && (
            <Alert variant="error" className={styles.error}>
              {serverError}
            </Alert>
          )}
          {errorEntries.length > 0 && (
            <FormErrorSummary
              errors={errorEntries}
              onFocusField={(fieldId) => {
                const el = document.getElementById(fieldId);
                el?.focus();
              }}
              className={styles.error}
            />
          )}
          <div className={styles.body}>{children}</div>
          {/* Hidden submit so Enter key triggers submit even with the footer button */}
          <input type="submit" hidden aria-hidden="true" tabIndex={-1} />
        </form>
      </Dialog>
    </FormProvider>
  );
}

// Re-export for callers that want the hook in the same import.
export { useFormContext };
