"use client";

import type { ReactNode } from "react";
import { AlertDialog } from "@/components/ui/AlertDialog";
import type { AlertDialogSize } from "@/components/ui/AlertDialog";
import styles from "./UnsavedChangesDialog.module.scss";

export interface UnsavedChangesDialogProps {
  /** Controlled open state. The parent owns when to prompt. */
  open: boolean;
  /** Controlled open-change handler. */
  onOpenChange: (open: boolean) => void;
  /**
   * Reliable indicator that the form has unsaved changes.
   * When false, the dialog will not render even if `open` is true.
   * Typically React Hook Form's `formState.isDirty`.
   */
  isDirty: boolean;
  /**
   * When true, the form has just been submitted successfully and
   * a discard warning is inappropriate. Suppresses rendering.
   */
  hasSubmitted?: boolean;
  /** Called when the user confirms discarding unsaved changes. */
  onConfirm: () => void;
  /** Called when the user chooses to keep editing. */
  onCancel: () => void;
  title?: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Render the confirm action as destructive (default true). */
  destructive?: boolean;
  size?: AlertDialogSize;
  className?: string;
}

export function UnsavedChangesDialog({
  open,
  onOpenChange,
  isDirty,
  hasSubmitted = false,
  onConfirm,
  onCancel,
  title = "Unsaved changes",
  description = "You have unsaved changes. Discard them and leave?",
  confirmLabel = "Discard",
  cancelLabel = "Keep editing",
  destructive = true,
  size = "sm",
  className,
}: UnsavedChangesDialogProps) {
  // Safety net: never warn when there are no reliable unsaved changes
  // or when the form has just been submitted successfully.
  const shouldRender = open && isDirty && !hasSubmitted;

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  return (
    <AlertDialog
      open={shouldRender}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      title={title}
      description={description}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      destructive={destructive}
      closeOnEscape
      size={size}
      className={`${styles.dialog} ${className ?? ""}`}
    />
  );
}
