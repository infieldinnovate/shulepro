"use client";

import type { ReactNode } from "react";
import type { UseFormReturn } from "react-hook-form";
import { FormDialog } from "../FormDialog";
import type { DialogSize } from "../../ui/Dialog";
import styles from "./RecordFormDialog.module.scss";

export interface RecordFormDialogProps<T extends Record<string, unknown>> {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  /** React Hook Form instance owning the form state. */
  form: UseFormReturn<T>;
  /** Called with validated values on submit. */
  onSubmit: (values: T) => void | Promise<void>;
  /** Optional override for the submit button label. Defaults to "Save". */
  submitLabel?: string;
  cancelLabel?: string;
  /** Optional server-side error message rendered above the fields. */
  serverError?: ReactNode;
  /** Dialog size. Defaults to "md". */
  size?: DialogSize;
  /** Field content (form controls). Composed inside FormDialog's form. */
  fields?: ReactNode;
  /** Optional secondary actions rendered inline-start in the footer. */
  secondary?: ReactNode;
  /** Close when the overlay backdrop is clicked. Defaults to false. */
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
  ariaLabel?: string;
  className?: string;
  bodyClassName?: string;
  footerClassName?: string;
}

export function RecordFormDialog<T extends Record<string, unknown>>({
  open,
  onClose,
  title,
  description,
  form,
  onSubmit,
  submitLabel,
  cancelLabel,
  serverError,
  size = "md",
  fields,
  secondary,
  closeOnOverlayClick = false,
  showCloseButton = true,
  ariaLabel,
  className,
  bodyClassName,
  footerClassName,
}: RecordFormDialogProps<T>) {
  return (
    <FormDialog<T>
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      form={form}
      onSubmit={onSubmit}
      submitLabel={submitLabel}
      cancelLabel={cancelLabel}
      serverError={serverError}
      size={size}
      showCloseButton={showCloseButton}
      closeOnOverlayClick={closeOnOverlayClick}
      ariaLabel={ariaLabel}
      className={className}
      bodyClassName={bodyClassName}
      footerClassName={footerClassName}
      secondary={secondary}
    >
      {fields && <div className={styles.fields}>{fields}</div>}
    </FormDialog>
  );
}
