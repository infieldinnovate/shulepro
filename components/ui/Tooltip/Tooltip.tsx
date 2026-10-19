"use client";

import {
  cloneElement,
  useId,
  useRef,
  useState,
} from "react";
import type { ReactElement, ReactNode } from "react";
import clsx from "clsx";
import styles from "./Tooltip.module.scss";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
  content: ReactNode;
  children: ReactElement;
  placement?: TooltipPlacement;
  /** Delay before showing, in ms. Default 300. */
  delay?: number;
  /** Accessible label for the tooltip trigger wrapper. */
  ariaLabel?: string;
  className?: string;
}

export function Tooltip({
  content,
  children,
  placement = "top",
  delay = 300,
  ariaLabel,
  className,
}: TooltipProps) {
  const generatedId = useId();
  const tooltipId = `${generatedId}-tooltip`;
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);

  const clearShowTimer = () => {
    if (showTimer.current) {
      clearTimeout(showTimer.current);
      showTimer.current = null;
    }
  };

  const handleShow = () => {
    clearShowTimer();
    showTimer.current = setTimeout(() => setOpen(true), delay);
  };

  const handleHide = () => {
    clearShowTimer();
    setOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      handleHide();
    }
  };

  const trigger = cloneElement(children, {
    "aria-describedby": open ? tooltipId : undefined,
    "aria-label": ariaLabel,
    onMouseEnter: handleShow,
    onMouseLeave: handleHide,
    onFocus: () => {
      clearShowTimer();
      setOpen(true);
    },
    onBlur: handleHide,
    onKeyDown: handleKeyDown,
  } as Record<string, unknown>);

  return (
    <span
      className={clsx(styles.container, className)}
      onPointerDown={handleHide}
    >
      <span className={styles.trigger}>{trigger}</span>
      {open && (
        <span
          id={tooltipId}
          role="tooltip"
          data-placement={placement}
          className={styles.tooltip}
        >
          {content}
        </span>
      )}
    </span>
  );
}
