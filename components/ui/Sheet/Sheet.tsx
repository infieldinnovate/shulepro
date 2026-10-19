"use client";

import { useId, useRef } from "react";
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
} from "../overlays/useOverlay";
import styles from "./Sheet.module.scss";

export type SheetSide = "left" | "right" | "top" | "bottom";
export type SheetSize = "sm" | "md" | "lg" | "fullscreen";

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  side?: SheetSide;
  size?: SheetSize;
  title?: ReactNode;
  description?: ReactNode;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  ariaLabel?: string;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  children?: ReactNode;
  footer?: ReactNode;
}

export function Sheet({
  open,
  onClose,
  side = "right",
  size = "md",
  title,
  description,
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
}: SheetProps) {
  const generatedId = useId();
  const titleId = `${generatedId}-title`;
  const descId = `${generatedId}-desc`;
  const sheetRef = useRef<HTMLDivElement>(null);
  const portalNode = usePortalTarget(open);

  useScrollLock(open);
  useFocusTrap(sheetRef, open);
  useRestoreFocus(sheetRef, open);
  useEscapeToClose(open, onClose, closeOnEscape);

  if (!open || !portalNode.current) return null;

  return createPortal(
    <>
      <div
        className={styles.overlay}
        onMouseDown={(e) => {
          if (closeOnOverlayClick && e.target === e.currentTarget) onClose();
        }}
      />
      <aside
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        aria-label={!title ? ariaLabel : undefined}
        tabIndex={-1}
        className={clsx(styles.sheet, styles[side], styles[size], className)}
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
                aria-label="Close panel"
                onClick={onClose}
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
      </aside>
    </>,
    portalNode.current,
  );
}
