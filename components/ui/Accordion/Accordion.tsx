"use client";
 
import { useCallback, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import styles from "./Accordion.module.scss";

export interface AccordionItem {
  id?: string;
  header: ReactNode;
  /** Optional secondary content rendered inline-end in the header. */
  headerMeta?: ReactNode;
  panel: ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** Allow multiple panels open at once. */
  multiple?: boolean;
  /** Controlled open indices (must be sorted ascending, unique). */
  openIndices?: number[];
  /** Initial open indices for uncontrolled usage. */
  defaultOpenIndices?: number[];
  /** Callback fired when the set of open indices changes. */
  onChange?: (openIndices: number[]) => void;
  className?: string;
}

export function Accordion({
  items,
  multiple = false,
  openIndices,
  defaultOpenIndices = [],
  onChange,
  className,
}: AccordionProps) {
  const accordionId = useId();
  const headerRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const [internalOpen, setInternalOpen] = useState<number[]>(() => {
    const deduped = Array.from(new Set(defaultOpenIndices)).sort((a, b) => a - b);
    return deduped.filter((i) => i >= 0 && i < items.length);
  });

  const isControlled = Array.isArray(openIndices);
  const openSet = useMemo(
    () => (isControlled ? new Set(openIndices!) : new Set(internalOpen)),
    [isControlled, openIndices, internalOpen],
  );

  const notify = useCallback(
    (next: number[]) => {
      if (!isControlled) setInternalOpen(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  const toggle = useCallback(
    (index: number) => {
      const isOpen = openSet.has(index);
      if (multiple) {
        const next = isOpen
          ? Array.from(openSet).filter((i) => i !== index)
          : Array.from(openSet).concat(index).sort((a, b) => a - b);
        notify(next);
      } else {
        notify(isOpen ? [] : [index]);
      }
    },
    [openSet, multiple, notify],
  );

  const focusHeader = useCallback((index: number) => {
    headerRefs.current[index]?.focus();
  }, []);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, current: number) => {
      const key = event.key;
      if (key === "ArrowDown" || key === "ArrowUp") {
        event.preventDefault();
        const dir = key === "ArrowDown" ? 1 : -1;
        let candidate = current;
        for (let step = 0; step < items.length; step += 1) {
          candidate = (candidate + dir + items.length) % items.length;
          if (!items[candidate]?.disabled) {
            focusHeader(candidate);
            return;
          }
        }
        return;
      }

      if (key === "Home") {
        event.preventDefault();
        const first = items.findIndex((it) => !it.disabled);
        if (first >= 0) focusHeader(first);
        return;
      }

      if (key === "End") {
        event.preventDefault();
        for (let i = items.length - 1; i >= 0; i -= 1) {
          if (!items[i]?.disabled) {
            focusHeader(i);
            return;
          }
        }
      }
    },
    [items, focusHeader],
  );

  const headerId = (index: number) => `${accordionId}-header-${index}`;
  const panelId = (index: number) => `${accordionId}-panel-${index}`;

  return (
    <div className={clsx(styles.accordion, className)}>
      {items.map((item, index) => {
        const isOpen = openSet.has(index);
        const disabled = Boolean(item.disabled);
        return (
          <div
            key={item.id ?? index}
            className={clsx(styles.item, isOpen && styles.itemOpen)}
            data-disabled={disabled || undefined}
          >
            <h3 className={styles.header}>
              <button
                type="button"
                ref={(el) => {
                  headerRefs.current[index] = el;
                }}
                aria-expanded={isOpen}
                aria-controls={panelId(index)}
                aria-disabled={disabled || undefined}
                disabled={disabled}
                className={styles.trigger}
                onClick={() => {
                  if (!disabled) toggle(index);
                }}
                onKeyDown={(e) => onKeyDown(e, index)}
              >
                <span className={styles.triggerLabel}>{item.header}</span>
                {item.headerMeta != null && (
                  <span className={styles.triggerMeta}>{item.headerMeta}</span>
                )}
                <ChevronDown
                  className={clsx(styles.chevron, isOpen && styles.chevronOpen)}
                  aria-hidden="true"
                />
              </button>
            </h3>
            <div
              role="region"
              id={panelId(index)}
              aria-labelledby={headerId(index)}
              hidden={!isOpen}
              className={styles.panel}
            >
              {isOpen ? item.panel : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}