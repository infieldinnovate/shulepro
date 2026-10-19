"use client";

import { useCallback, useId, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import clsx from "clsx";
import styles from "./Tabs.module.scss";

export type TabsOrientation = "horizontal" | "vertical";

export interface TabItem {
  id?: string;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  /** Tab definitions. */
  items: TabItem[];
  /** Controlled selected index (0-based). */
  selectedIndex?: number;
  /** Initial selected index for uncontrolled usage. */
  defaultIndex?: number;
  /** Callback fired when the selected index changes. */
  onSelect?: (index: number) => void;
  orientation?: TabsOrientation;
  /** Accessible label for the tablist. */
  ariaLabel?: string;
  className?: string;
}

function getDirection(orientation: TabsOrientation) {
  return orientation === "vertical"
    ? { next: "ArrowDown", prev: "ArrowUp", axis: "vertical" as const }
    : { next: "ArrowRight", prev: "ArrowLeft", axis: "horizontal" as const };
}

export function Tabs({
  items,
  selectedIndex,
  defaultIndex = 0,
  onSelect,
  orientation = "horizontal",
  ariaLabel,
  className,
}: TabsProps) {
  const tabsId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [internalIndex, setInternalIndex] = useState<number>(() => {
    // Skip disabled tabs when picking the initial value.
    const start = Math.min(Math.max(defaultIndex, 0), Math.max(items.length - 1, 0));
    let found = start;
    if (items[found]?.disabled) {
      found = items.findIndex((it) => !it.disabled);
    }
    return found < 0 ? 0 : found;
  });

  const isControlled = typeof selectedIndex === "number";
  const activeIndex = isControlled ? (selectedIndex as number) : internalIndex;

  const setActive = useCallback(
    (next: number) => {
      if (!isControlled) setInternalIndex(next);
      onSelect?.(next);
    },
    [isControlled, onSelect],
  );

  const focusTab = useCallback((index: number) => {
    tabRefs.current[index]?.focus();
  }, []);

  const onTabKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, current: number) => {
      const { next, prev } = getDirection(orientation);
      const key = event.key;

      if (key === next || key === prev) {
        event.preventDefault();
        const dir = key === next ? 1 : -1;
        // Rove within the enabled tabs, wrapping around.
        let candidate = current;
        for (let step = 0; step < items.length; step += 1) {
          candidate = (candidate + dir + items.length) % items.length;
          if (!items[candidate]?.disabled) {
            setActive(candidate);
            focusTab(candidate);
            return;
          }
        }
        return;
      }

      if (key === "Home") {
        event.preventDefault();
        const first = items.findIndex((it) => !it.disabled);
        if (first >= 0) {
          setActive(first);
          focusTab(first);
        }
        return;
      }

      if (key === "End") {
        event.preventDefault();
        for (let i = items.length - 1; i >= 0; i -= 1) {
          if (!items[i]?.disabled) {
            setActive(i);
            focusTab(i);
            return;
          }
        }
        return;
      }
    },
    [items, orientation, setActive, focusTab],
  );

  const tabId = (index: number) => `${tabsId}-tab-${index}`;
  const panelId = (index: number) => `${tabsId}-panel-${index}`;

  return (
    <div
      className={clsx(styles.tabs, styles[orientation], className)}
      data-orientation={orientation}
    >
      <div
        role="tablist"
        aria-label={ariaLabel}
        aria-orientation={orientation}
        className={styles.tablist}
      >
        {items.map((item, index) => {
          const selected = index === activeIndex;
          const disabled = Boolean(item.disabled);
          return (
            <button
              key={item.id ?? index}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              role="tab"
              id={tabId(index)}
              aria-selected={selected}
              aria-controls={selected ? panelId(index) : undefined}
              aria-disabled={disabled || undefined}
              tabIndex={selected ? 0 : -1}
              disabled={disabled}
              className={clsx(styles.tab, selected && styles.selected)}
              onClick={() => {
                if (!disabled) setActive(index);
              }}
              onKeyDown={(e) => onTabKeyDown(e, index)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item, index) => {
        const selected = index === activeIndex;
        return (
          <div
            key={item.id ?? index}
            role="tabpanel"
            id={panelId(index)}
            aria-labelledby={tabId(index)}
            hidden={!selected}
            tabIndex={0}
            className={clsx(styles.panel, selected && styles.panelActive)}
          >
            {selected ? item.content : null}
          </div>
        );
      })}
    </div>
  );
}