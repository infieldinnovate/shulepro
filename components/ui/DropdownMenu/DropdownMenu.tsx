"use client";

import {
  cloneElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type {
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  ReactNode,
} from "react";
import { ChevronRight } from "lucide-react";
import clsx from "clsx";
import styles from "./DropdownMenu.module.scss";

// ============================================================
// DropdownMenu — accessible menu primitive
// Composite item model. Items declare a `type`:
//   - "item"     : a plain action
//   - "label"    : a non-interactive group heading
//   - "divider"  : a visual separator
//   - "radioItem": a member of a radio group (`radioGroup` + `value`)
//   - "subMenu"  : a nested menu (rendered via `items`)
// ============================================================

export interface DropdownMenuItemBase {
  id?: string;
  disabled?: boolean;
}

export interface DropdownMenuActionItem extends DropdownMenuItemBase {
  type?: "item";
  label: ReactNode;
  icon?: ReactNode;
  shortcut?: string;
  onSelect?: () => void;
}

export interface DropdownMenuRadioItem extends DropdownMenuItemBase {
  type: "radioItem";
  radioGroup: string;
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  onSelect?: () => void;
}

export interface DropdownMenuLabelItem extends DropdownMenuItemBase {
  type: "label";
  label: ReactNode;
}

export interface DropdownMenuDividerItem extends DropdownMenuItemBase {
  type: "divider";
}

export interface DropdownMenuSubMenuItem extends DropdownMenuItemBase {
  type: "subMenu";
  label: ReactNode;
  icon?: ReactNode;
  items: DropdownMenuChildItem[];
}

export type DropdownMenuChildItem =
  | DropdownMenuActionItem
  | DropdownMenuRadioItem
  | DropdownMenuLabelItem
  | DropdownMenuDividerItem;

export type DropdownMenuItem =
  | DropdownMenuActionItem
  | DropdownMenuRadioItem
  | DropdownMenuLabelItem
  | DropdownMenuDividerItem
  | DropdownMenuSubMenuItem;

export interface DropdownMenuProps {
  items: DropdownMenuItem[];
  trigger?: ReactNode;
  triggerLabel?: string;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: "start" | "center" | "end";
  ariaLabel?: string;
  /** Radio group values keyed by group id. */
  radioValues?: Record<string, string>;
  onRadioValueChange?: (group: string, value: string) => void;
  className?: string;
}

type FlatItem =
  | { kind: "action"; item: DropdownMenuActionItem; index: number }
  | { kind: "radio"; item: DropdownMenuRadioItem; index: number }
  | { kind: "label"; item: DropdownMenuLabelItem }
  | { kind: "divider" }
  | { kind: "submenu"; item: DropdownMenuSubMenuItem; index: number };

function isInteractive(
  entry: FlatItem,
): entry is
  | { kind: "action"; item: DropdownMenuActionItem; index: number }
  | { kind: "radio"; item: DropdownMenuRadioItem; index: number }
  | { kind: "submenu"; item: DropdownMenuSubMenuItem; index: number } {
  return (
    (entry.kind === "action" ||
      entry.kind === "radio" ||
      entry.kind === "submenu") &&
    !entry.item.disabled
  );
}

function flatten(items: DropdownMenuItem[]): FlatItem[] {
  let actionIndex = 0;
  return items.map((item) => {
    if (item.type === "label") return { kind: "label", item };
    if (item.type === "divider") return { kind: "divider" };
    if (item.type === "radioItem")
      return { kind: "radio", item, index: actionIndex++ };
    if (item.type === "subMenu")
      return { kind: "submenu", item, index: actionIndex++ };
    return { kind: "action", item, index: actionIndex++ };
  });
}

export function DropdownMenu({
  items,
  trigger,
  triggerLabel,
  defaultOpen = false,
  open,
  onOpenChange,
  align = "start",
  ariaLabel,
  radioValues,
  onRadioValueChange,
  className,
}: DropdownMenuProps) {
  const generatedId = useId();
  const menuId = `${generatedId}-menu`;

  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = isControlled ? open : internalOpen;

  const [activeIndex, setActiveIndex] = useState(-1);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);

  const flat = flatten(items);
  const interactiveIndices = flat
    .map((entry, i) => (isInteractive(entry) ? i : -1))
    .filter((i) => i >= 0);

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const closeAll = useCallback(
    (returnFocus: boolean) => {
      setOpenSubmenu(null);
      setActiveIndex(-1);
      setOpen(false);
      if (returnFocus) triggerRef.current?.focus();
    },
    [setOpen],
  );

  // Outside click dismiss
  useEffect(() => {
    if (!isOpen) return;
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        closeAll(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen, closeAll]);

  // Initial focus into the menu
  useEffect(() => {
    if (!isOpen) return;
    const t = window.setTimeout(() => {
      if (activeIndex < 0 && interactiveIndices.length > 0) {
        setActiveIndex(interactiveIndices[0]);
      }
      itemRefs.current[activeIndex >= 0 ? activeIndex : interactiveIndices[0]]?.focus();
    }, 0);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Scroll active item into view
  useLayoutEffect(() => {
    if (!isOpen || activeIndex < 0) return;
    itemRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, isOpen]);

  const moveTo = useCallback(
    (delta: number) => {
      const len = interactiveIndices.length;
      if (len === 0) return;
      const currentPos = interactiveIndices.indexOf(activeIndex);
      let nextPos = currentPos + delta;
      if (nextPos < 0) nextPos = len - 1;
      if (nextPos >= len) nextPos = 0;
      const nextIndex = interactiveIndices[nextPos];
      setActiveIndex(nextIndex);
      setOpenSubmenu(null);
      itemRefs.current[nextIndex]?.focus();
    },
    [activeIndex, interactiveIndices],
  );

  const firstItem = useCallback(() => {
    if (interactiveIndices.length === 0) return;
    const idx = interactiveIndices[0];
    setActiveIndex(idx);
    itemRefs.current[idx]?.focus();
  }, [interactiveIndices]);

  const lastItem = useCallback(() => {
    if (interactiveIndices.length === 0) return;
    const idx = interactiveIndices[interactiveIndices.length - 1];
    setActiveIndex(idx);
    itemRefs.current[idx]?.focus();
  }, [interactiveIndices]);

  const selectItem = useCallback(
    (entry: FlatItem) => {
      if (entry.kind === "action") {
        entry.item.onSelect?.();
        closeAll(true);
      } else if (entry.kind === "radio") {
        onRadioValueChange?.(entry.item.radioGroup, entry.item.value);
        entry.item.onSelect?.();
        closeAll(true);
      }
    },
    [closeAll, onRadioValueChange],
  );

  const onMenuKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        moveTo(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveTo(-1);
        break;
      case "Home":
        event.preventDefault();
        firstItem();
        break;
      case "End":
        event.preventDefault();
        lastItem();
        break;
      case "Escape":
        event.preventDefault();
        closeAll(true);
        break;
      case "ArrowRight": {
        const entry = flat[activeIndex];
        if (entry && entry.kind === "submenu") {
          event.preventDefault();
          setOpenSubmenu(entry.item.id ?? entry.item.label as string);
        }
        break;
      }
      case "ArrowLeft":
        if (openSubmenu) {
          event.preventDefault();
          setOpenSubmenu(null);
          itemRefs.current[activeIndex]?.focus();
        }
        break;
      case "Enter":
      case " ": {
        event.preventDefault();
        const entry = flat[activeIndex];
        if (entry) selectItem(entry);
        break;
      }
      default:
        break;
    }
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
    }
  };

  const defaultTrigger = (
    <button
      ref={triggerRef}
      type="button"
      className={styles.trigger}
      aria-haspopup="menu"
      aria-expanded={isOpen}
      aria-controls={isOpen ? menuId : undefined}
      onClick={() => setOpen(!isOpen)}
      onKeyDown={onTriggerKeyDown}
    >
      <span>{triggerLabel}</span>
      <ChevronRight
        className={clsx(styles.chevron, isOpen && styles.chevronOpen)}
        aria-hidden="true"
        style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
      />
    </button>
  );

  const triggerNode = trigger
    ? cloneElement(trigger as ReactElement, {
        ref: triggerRef,
        "aria-haspopup": "menu",
        "aria-expanded": isOpen,
        "aria-controls": isOpen ? menuId : undefined,
        onClick: () => setOpen(!isOpen),
        onKeyDown: onTriggerKeyDown,
      } as Record<string, unknown>)
    : defaultTrigger;

  return (
    <div ref={containerRef} className={clsx(styles.submenuContainer, className)}>
      {triggerNode}
      {isOpen && (
        <div
          id={menuId}
          role="menu"
          aria-label={ariaLabel}
          data-align={align}
          className={styles.menu}
        >
          <ul
            ref={listRef}
            role="presentation"
            className={styles.list}
            onKeyDown={onMenuKeyDown}
          >
            {flat.map((entry, i) => {
              if (entry.kind === "divider") {
                return (
                  <li key={`divider-${i}`} role="separator" className={styles.divider} />
                );
              }
              if (entry.kind === "label") {
                return (
                  <li
                    key={`label-${i}`}
                    role="presentation"
                    className={styles.label}
                  >
                    {entry.item.label}
                  </li>
                );
              }
              const isActive = i === activeIndex;
              const commonProps = {
                ref: (el: HTMLElement | null) => {
                  itemRefs.current[i] = el;
                },
                role: "menuitem",
                tabIndex: isActive ? 0 : -1,
                "data-highlighted": isActive || undefined,
                className: clsx(styles.item, isActive && styles.itemActive),
                onClick: (e: MouseEvent) => {
                  e.stopPropagation();
                  selectItem(entry);
                },
                onMouseEnter: () => {
                  setActiveIndex(i);
                },
              };
              if (entry.kind === "action" || entry.kind === "radio") {
                const radioChecked =
                  entry.kind === "radio" &&
                  radioValues?.[entry.item.radioGroup] === entry.item.value;
                return (
                  <li key={`item-${i}`} role="none">
                    <button
                      type="button"
                      disabled={entry.item.disabled}
                      {...commonProps}
                    >
                      {entry.item.icon && (
                        <span className={styles.itemIcon}>{entry.item.icon}</span>
                      )}
                      <span className={styles.itemLabel}>{entry.item.label}</span>
                      {entry.kind === "action" && entry.item.shortcut && (
                        <span className={styles.itemShortcut}>
                          {entry.item.shortcut}
                        </span>
                      )}
                      {entry.kind === "radio" && (
                        <span className={styles.itemCheck} aria-hidden="true">
                          {radioChecked ? "✓" : ""}
                        </span>
                      )}
                    </button>
                  </li>
                );
              }
              // submenu
              const subId = entry.item.id ?? `sub-${i}`;
              const subOpen = openSubmenu === subId;
              return (
                <li key={`item-${i}`} role="none" className={styles.submenuContainer}>
                  <button
                    type="button"
                    disabled={entry.item.disabled}
                    {...commonProps}
                    aria-haspopup="menu"
                    aria-expanded={subOpen}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenSubmenu(subOpen ? null : subId);
                    }}
                  >
                    {entry.item.icon && (
                      <span className={styles.itemIcon}>{entry.item.icon}</span>
                    )}
                    <span className={styles.itemLabel}>{entry.item.label}</span>
                    <ChevronRight className={styles.submenuChevron} aria-hidden="true" />
                  </button>
                  {subOpen && (
                    <div className={styles.submenu} role="menu">
                      <ul role="presentation" className={styles.list}>
                        {entry.item.items.map((child, ci) => {
                          if (child.type === "divider") {
                            return (
                              <li
                                key={`sub-div-${ci}`}
                                role="separator"
                                className={styles.divider}
                              />
                            );
                          }
                          if (child.type === "label") {
                            return (
                              <li
                                key={`sub-lbl-${ci}`}
                                role="presentation"
                                className={styles.label}
                              >
                                {child.label}
                              </li>
                            );
                          }
                          const subChecked =
                            child.type === "radioItem" &&
                            radioValues?.[child.radioGroup] === child.value;
                          return (
                            <li key={`sub-item-${ci}`} role="none">
                              <button
                                type="button"
                                role="menuitem"
                                disabled={child.disabled}
                                className={styles.item}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (child.type === "radioItem") {
                                    onRadioValueChange?.(
                                      child.radioGroup,
                                      child.value,
                                    );
                                  }
                                  child.onSelect?.();
                                  closeAll(true);
                                }}
                              >
                                {child.icon && (
                                  <span className={styles.itemIcon}>
                                    {child.icon}
                                  </span>
                                )}
                                <span className={styles.itemLabel}>
                                  {child.label}
                                </span>
                                {child.type === "radioItem" && (
                                  <span className={styles.itemCheck} aria-hidden="true">
                                    {subChecked ? "✓" : ""}
                                  </span>
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
