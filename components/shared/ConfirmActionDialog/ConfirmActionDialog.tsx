"use client";

import type { ReactNode } from "react";
import { AlertDialog } from "../../ui/AlertDialog";
import type { AlertDialogSize } from "../../ui/AlertDialog";
import styles from "./ConfirmActionDialog.module.scss";

export interface ConfirmActionDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /**
   * Style the confirm action as destructive. Defaults to true so that
   * any destructive operation requires an explicit opt-out to render as
   * a non-destructive confirmation.
   */
  destructive?: boolean;
  /** Disable the confirm button (e.g. while a request is in flight). */
  confirmLoading?: boolean;
  confirmDisabled?: boolean;
  closeOnEscape?: boolean;
  closeOnOverlayClick?: boolean;
  size?: AlertDialogSize;
  ariaLabel?: string;
  className?: string;
}

export function ConfirmActionDialog({
  open,
  onConfirm,
  onCancel,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = true,
  confirmLoading = false,
  confirmDisabled = false,
  closeOnEscape = true,
  closeOnOverlayClick = false,
  size = "sm",
  ariaLabel,
  className,
}: ConfirmActionDialogProps) {
  return (
    <AlertDialog
      open={open}
      onConfirm={onConfirm}
      onCancel={onCancel}
      title={title}
      description={description}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      destructive={destructive}
      confirmLoading={confirmLoading}
      confirmDisabled={confirmDisabled}
      closeOnEscape={closeOnEscape}
      closeOnOverlayClick={closeOnOverlayClick}
      size={size}
      ariaLabel={ariaLabel}
      className={`${styles.dialog} ${className ?? ""}`}
    />
  );
}
