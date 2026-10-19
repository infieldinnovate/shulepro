"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import {
  useFocusTrap,
  usePortalTarget,
  useRestoreFocus,
} from "../overlays/useOverlay";
import styles from "./Popover.module.scss";

export interface PopoverProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger: ReactNode;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
  align?: "start" | "center" | "end";
  ariaLabel?: string;
  /** Render the floating content into a portal at document.body. */
  portal?: boolean;
  /** Trap keyboard focus inside the popover while open. */
  trapFocus?: boolean;
}

export function Popover({
  open,
  defaultOpen = false,
  onOpenChange,
  trigger,
  children,
  disabled = false,
  className,
  contentClassName,
  align = "start",
  ariaLabel,
  portal = false,
  trapFocus = false,
}: PopoverProps) {
  const generatedId = useId();
  const contentId = `${generatedId}-content`;

  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = isControlled ? open : internalOpen;

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const portalNode = usePortalTarget(portal && isOpen);

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  // Close on outside pointer down. When portalled, the content lives
  // outside the container subtree, so we check both refs.
  useEffect(() => {
    if (!isOpen) return;
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      const insideContainer =
        containerRef.current?.contains(target) ?? false;
      const insideContent =
        contentRef.current?.contains(target) ?? false;
      if (!insideContainer && !insideContent) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () =>
      document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen, setOpen]);

  // Escape to close + restore focus
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setOpen]);

  useRestoreFocus(contentRef, isOpen && trapFocus);
  useFocusTrap(contentRef, isOpen && trapFocus);

  // Move focus into content on open (non-trapped mode keeps the
  // original behaviour: first focusable / [data-autofocus]).
  useEffect(() => {
    if (isOpen && !trapFocus) {
      const t = window.setTimeout(() => {
        const focusable =
          contentRef.current?.querySelector<HTMLElement>(
            "[data-autofocus], button, [tabindex]:not([tabindex='-1'])",
          );
        focusable?.focus();
      }, 0);
      return () => window.clearTimeout(t);
    }
  }, [isOpen, trapFocus]);

  const handleTriggerKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;
    if (
      event.key === "ArrowDown" ||
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      setOpen(true);
    }
  };

  const triggerElement = (
    <span
      ref={triggerRef as React.RefObject<HTMLElement>}
      className={styles.triggerWrapper}
      onClick={() => {
        if (!disabled) setOpen(!isOpen);
      }}
      onKeyDown={handleTriggerKeyDown}
      role="presentation"
    >
      {trigger}
    </span>
  );

  const content = (
    <div
      ref={contentRef}
      id={contentId}
      role="dialog"
      aria-modal="false"
      aria-label={ariaLabel}
      data-align={align}
      className={clsx(styles.content, contentClassName)}
    >
      {children}
    </div>
  );

  return (
    <div ref={containerRef} className={clsx(styles.container, className)}>
      {triggerElement}
      {isOpen &&
        (portal && portalNode.current
          ? createPortal(content, portalNode.current)
          : content)}
    </div>
  );
}
