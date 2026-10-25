"use client";

import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import clsx from "clsx";
import {
  useEscapeToClose,
  useFocusTrap,
  usePortalTarget,
  useRestoreFocus,
  useScrollLock,
} from "@/components/ui/overlays/useOverlay";
import styles from "./Dialog.module.scss";

export type DialogSize = "sm" | "md" | "lg" | "fullscreen";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  size?: DialogSize;
  /** Show the top-right close button. Defaults to true. */
  showCloseButton?: boolean;
  /** Close when the overlay backdrop is clicked. Defaults to true. */
  closeOnOverlayClick?: boolean;
  /** Close on Escape. Defaults to true. */
  closeOnEscape?: boolean;
  /** Accessible name if no title is supplied. */
  ariaLabel?: string;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  children?: ReactNode;
  footer?: ReactNode;
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  size = "md",
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  ariaLabel,
  className,
  headerClassName,
  bodyClassName,
  footerClassName,
  children,
  footer,
}: DialogProps) {
  const generatedId = useId();
  const titleId = `${generatedId}-title`;
  const descId = `${generatedId}-desc`;
  const dialogRef = useRef<HTMLDivElement>(null);
  const portalNode = usePortalTarget(open);

  useScrollLock(open);
  useFocusTrap(dialogRef, open);
  useRestoreFocus(dialogRef, open);
  useEscapeToClose(open, onClose, closeOnEscape);

  useEffect(() => {
    if (!open) return;
    const prevTabindex = document.body.getAttribute("tabindex");
    return () => {
      if (prevTabindex === null) document.body.removeAttribute("tabindex");
    };
  }, [open]);

  if (!open || !portalNode.current) return null;

  const labelledBy = title ? titleId : undefined;
  const describedBy = description ? descId : undefined;

  return createPortal(
    <div
      className={styles.overlay}
      onMouseDown={(e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        aria-label={!title ? ariaLabel : undefined}
        tabIndex={-1}
        className={clsx(styles.dialog, styles[size], className)}
      >
        {(title || showCloseButton) && (
          <header className={clsx(styles.header, headerClassName)}>
            <div className={styles.titleWrap}>
              {title && (
                <h2 id={titleId} className={styles.title}>
                  {title}
                </h2>
              )}
              {description && (
                <p id={descId} className={styles.description}>
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                type="button"
                className={styles.closeButton}
                aria-label="Close dialog"
                onClick={onClose}
                data-autofocus={undefined}
              >
                <X aria-hidden="true" />
              </button>
            )}
          </header>
        )}
        <div className={clsx(styles.body, bodyClassName)}>{children}</div>
        {footer && (
          <footer className={clsx(styles.footer, footerClassName)}>{footer}</footer>
        )}
      </div>
    </div>,
    portalNode.current,
  );
}
