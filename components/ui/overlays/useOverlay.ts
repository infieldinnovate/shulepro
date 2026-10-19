"use client";

import { useCallback, useEffect, useRef } from "react";
import type { RefObject } from "react";

// ============================================================
// Shared overlay hooks — focus trap, scroll lock, focus restore,
// portal target. Used by Dialog, AlertDialog, Sheet, Popover, and
// DropdownMenu. Client-only; imported only by client components.
// ============================================================

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "iframe",
  "object",
  "embed",
  "[tabindex]:not([tabindex='-1'])",
  "[contenteditable='true']",
  "[data-autofocus]",
]
  .map((s) => `${s}:not([hidden]):not([aria-hidden='true'])`)
  .join(", ");

export function getFocusableCandidates(
  container: HTMLElement | null,
): HTMLElement[] {
  if (!container) return [];
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter(
    (el) =>
      el.offsetWidth > 0 ||
      el.offsetHeight > 0 ||
      el.getClientRects().length > 0,
  );
}

/**
 * Trap keyboard focus inside `container` while `active` is true.
 * Cycles Tab/Shift+Tab, keeps focus within the region.
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  active: boolean,
) {
  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;
    const node = container;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Tab") return;
      const candidates = getFocusableCandidates(node);
      if (candidates.length === 0) {
        event.preventDefault();
        node.focus();
        return;
      }
      const first = candidates[0];
      const last = candidates[candidates.length - 1];
      const activeEl = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (activeEl === first || !node.contains(activeEl)) {
          event.preventDefault();
          last.focus();
        }
      } else {
        if (activeEl === last || !node.contains(activeEl)) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [containerRef, active]);
}

/**
 * Move focus into `container` when `active` becomes true, falling
 * back to the container itself. Returns the element that had focus
 * before activation so it can be restored.
 */
export function useRestoreFocus(
  containerRef: RefObject<HTMLElement | null>,
  active: boolean,
) {
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (active) {
      previousFocus.current = document.activeElement as HTMLElement | null;
      const t = window.setTimeout(() => {
        const container = containerRef.current;
        if (!container) return;
        const auto = container.querySelector<HTMLElement>("[data-autofocus]");
        const target =
          auto ??
          getFocusableCandidates(container)[0] ??
          container;
        target.focus({ preventScroll: true });
      }, 0);
      return () => window.clearTimeout(t);
    }

    if (!active && previousFocus.current) {
      const prev = previousFocus.current;
      const t = window.setTimeout(() => {
        if (typeof prev.focus === "function") prev.focus({ preventScroll: true });
      }, 0);
      previousFocus.current = null;
      return () => window.clearTimeout(t);
    }
  }, [containerRef, active]);
}

/**
 * Lock body scroll while `active` is true. Restores previous overflow.
 */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const { body } = document;
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
    };
  }, [active]);
}

/**
 * Provide a stable portal node appended to document.body.
 * Returns null during SSR / before mount.
 */
export function usePortalTarget(active: boolean) {
  const nodeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!active) return;
    if (typeof document === "undefined") return;
    const node = document.createElement("div");
    node.className = "shule-portal";
    node.style.position = "relative";
    node.style.zIndex = "var(--z-modal)";
    document.body.appendChild(node);
    nodeRef.current = node;
    return () => {
      if (nodeRef.current && nodeRef.current.parentNode) {
        nodeRef.current.parentNode.removeChild(nodeRef.current);
      }
      nodeRef.current = null;
    };
  }, [active]);

  return nodeRef;
}

/**
 * Close on Escape. Calls `onClose` and optionally prevents default.
 */
export function useEscapeToClose(
  active: boolean,
  onClose: () => void,
  enabled = true,
) {
  const handler = useCallback(onClose, [onClose]);
  useEffect(() => {
    if (!active || !enabled) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        handler();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, enabled, handler]);
}
