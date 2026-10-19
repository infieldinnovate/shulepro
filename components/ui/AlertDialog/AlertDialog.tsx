"use client";

import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import {
  useFocusTrap,
  usePortalTarget,
  useRestoreFocus,
  useScrollLock,
  useEscapeToClose,
} from "../overlays/useOverlay";
import dialogStyles from "../Dialog/Dialog.module.scss";
import styles from "./AlertDialog.module.scss";

export type AlertDialogSize = "sm" | "md";

export interface AlertDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Style the confirm action as destructive. */
  destructive?: boolean;
  /** Disable the confirm button (e.g. while a request is in flight). */
  confirmLoading?: boolean;
  /** Disable the confirm button entirely. */
  confirmDisabled?: boolean;
  /** Close on Escape (calls onCancel). Defaults to true. */
  closeOnEscape?: boolean;
  /** Close when the overlay backdrop is clicked (calls onCancel). Defaults to false. */
  closeOnOverlayClick?: boolean;
  size?: AlertDialogSize;
  ariaLabel?: string;
  className?: string;
}

export function AlertDialog({
  open,
  onConfirm,
  onCancel,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  confirmLoading = false,
  confirmDisabled = false,
  closeOnEscape = true,
  closeOnOverlayClick = false,
  size = "sm",
  ariaLabel,
  className,
}: AlertDialogProps) {
  const generatedId = useId();
  const titleId = `${generatedId}-title`;
  const descId = `${generatedId}-desc`;
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const portalNode = usePortalTarget(open);

  useScrollLock(open);
  useFocusTrap(dialogRef, open);
  useRestoreFocus(dialogRef, open);
  useEscapeToClose(open, onCancel, closeOnEscape);

  // Focus the least destructive action on open. When destructive,
  // that is the cancel button; otherwise it is the confirm button.
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      if (destructive) cancelRef.current?.focus();
      else confirmRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(t);
  }, [open, destructive]);

  if (!open || !portalNode.current) return null;

  return createPortal(
    <div
      className={dialogStyles.overlay}
      onMouseDown={(e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        aria-label={!title ? ariaLabel : undefined}
        tabIndex={-1}
        className={clsx(dialogStyles.dialog, dialogStyles[size], styles.alertDialog, className)}
      >
        <header className={dialogStyles.header}>
          <div className={dialogStyles.titleWrap}>
            <h2 id={titleId} className={dialogStyles.title}>
              {title}
            </h2>
            {description && (
              <p id={descId} className={dialogStyles.description}>
                {description}
              </p>
            )}
          </div>
        </header>
        <footer className={clsx(dialogStyles.footer, styles.footer)}>
          <button
            ref={cancelRef}
            type="button"
            className={clsx(dialogStyles.closeButton, styles.cancelButton)}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            className={clsx(
              styles.confirmButton,
              destructive ? styles.destructive : styles.primary,
            )}
            onClick={onConfirm}
            disabled={confirmDisabled || confirmLoading}
            aria-busy={confirmLoading || undefined}
          >
            {confirmLabel}
          </button>
        </footer>
      </div>
    </div>,
    portalNode.current,
  );
}
