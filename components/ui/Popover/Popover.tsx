"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import clsx from "clsx";
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
}: PopoverProps) {
  const generatedId = useId();
  const contentId = `${generatedId}-content`;

  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = isControlled ? open : internalOpen;

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  // Close on outside pointer down
  useEffect(() => {
    if (!isOpen) return;
    function handlePointerDown(event: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
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

  // Move focus into content on open
  useEffect(() => {
    if (isOpen) {
      const t = window.setTimeout(() => {
        const focusable =
          contentRef.current?.querySelector<HTMLElement>(
            "[data-autofocus], button, [tabindex]:not([tabindex='-1'])",
          );
        focusable?.focus();
      }, 0);
      return () => window.clearTimeout(t);
    }
  }, [isOpen]);

  const handleTriggerKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
    }
  };

  // Clone trigger to inject aria + click handler
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

  return (
    <div ref={containerRef} className={clsx(styles.container, className)}>
      {triggerElement}
      {isOpen && (
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
      )}
    </div>
  );
}
