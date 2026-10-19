"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import clsx from "clsx";
import styles from "./Combobox.module.scss";

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  name?: string;
  label?: ReactNode;
  helperText?: ReactNode;
  errorText?: ReactNode;
  clearable?: boolean;
  className?: string;
  id?: string;
}

export function Combobox({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  emptyText = "No options found",
  disabled = false,
  invalid = false,
  required = false,
  name,
  label,
  helperText,
  errorText,
  clearable = false,
  className,
  id,
}: ComboboxProps) {
  const generatedId = useId();
  const comboboxId = id ?? generatedId;
  const listboxId = `${comboboxId}-listbox`;
  const helperId = helperText ? `${comboboxId}-helper` : undefined;
  const errorId = errorText ? `${comboboxId}-error` : undefined;
  const describedBy =
    [helperId, errorId].filter(Boolean).join(" ") || undefined;
  const isInvalid = invalid || Boolean(errorText);

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const selectedValue = isControlled ? value : internalValue;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === selectedValue),
    [options, selectedValue],
  );

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(normalizedQuery),
    );
  }, [options, query]);

  const selectOption = useCallback(
    (optionValue: string) => {
      if (!isControlled) setInternalValue(optionValue);
      onValueChange?.(optionValue);
      setOpen(false);
      setQuery("");
      setActiveIndex(-1);
    },
    [isControlled, onValueChange],
  );

  const clearSelection = useCallback(() => {
    if (!isControlled) setInternalValue("");
    onValueChange?.("");
    setQuery("");
    setActiveIndex(-1);
  }, [isControlled, onValueChange]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setQuery("");
        setActiveIndex(-1);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  // Focus management on open
  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => {
        inputRef.current?.focus();
        const selectedIndex = filteredOptions.findIndex(
          (option) => option.value === selectedValue,
        );
        setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
      }, 0);
      return () => window.clearTimeout(t);
    }
  }, [open, filteredOptions, selectedValue]);

  // Scroll active option into view
  useLayoutEffect(() => {
    if (!open || activeIndex < 0) return;
    const listbox = listboxRef.current;
    if (!listbox) return;
    const activeEl = listbox.querySelector<HTMLElement>(
      `[data-index="${activeIndex}"]`,
    );
    activeEl?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;

    switch (event.key) {
      case "Enter": {
        event.preventDefault();
        if (open && activeIndex >= 0) {
          const option = filteredOptions[activeIndex];
          if (option && !option.disabled) selectOption(option.value);
        } else if (!open) {
          setOpen(true);
        }
        break;
      }
      case "Escape": {
        if (open) {
          event.preventDefault();
          setOpen(false);
          setQuery("");
          setActiveIndex(-1);
          triggerRef.current?.focus();
        }
        break;
      }
      case "ArrowDown": {
        event.preventDefault();
        if (!open) {
          setOpen(true);
        } else {
          const next = findNextEnabled(filteredOptions, activeIndex, 1);
          if (next !== -1) setActiveIndex(next);
        }
        break;
      }
      case "ArrowUp": {
        event.preventDefault();
        if (open) {
          const prev = findNextEnabled(filteredOptions, activeIndex, -1);
          if (prev !== -1) setActiveIndex(prev);
        }
        break;
      }
      case "Home": {
        if (open) {
          event.preventDefault();
          const first = findNextEnabled(filteredOptions, -1, 1);
          if (first !== -1) setActiveIndex(first);
        }
        break;
      }
      case "End": {
        if (open) {
          event.preventDefault();
          const last = findNextEnabled(filteredOptions, filteredOptions.length, -1);
          if (last !== -1) setActiveIndex(last);
        }
        break;
      }
    }
  };

  const triggerLabel = selectedOption ? selectedOption.label : placeholder;
  const showClear = clearable && selectedValue && !disabled;

  return (
    <div
      ref={containerRef}
      className={clsx(
        styles.container,
        isInvalid && styles.invalid,
        disabled && styles.disabled,
        className,
      )}
      onKeyDown={handleKeyDown}
    >
      {label && (
        <label htmlFor={comboboxId} className={styles.label}>
          {label}
          {required && (
            <span className={styles.requiredMark} aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      <button
        ref={triggerRef}
        id={comboboxId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-describedby={describedBy}
        aria-label={label ? undefined : placeholder}
        className={styles.trigger}
        onClick={() => {
          if (disabled) return;
          setOpen((prev) => !prev);
        }}
      >
        <span className={styles.triggerText} data-placeholder={!selectedOption}>
          {triggerLabel}
        </span>
        <span className={styles.triggerIcons}>
          {showClear && (
            <span
              role="button"
              tabIndex={-1}
              aria-label="Clear selection"
              className={styles.clearButton}
              onClick={(e) => {
                e.stopPropagation();
                clearSelection();
              }}
            >
              <X className={styles.clearIcon} aria-hidden="true" />
            </span>
          )}
          <ChevronDown
            className={clsx(styles.chevron, open && styles.chevronOpen)}
            aria-hidden="true"
          />
        </span>
      </button>

      {open && (
        <div className={styles.popover} role="presentation">
          <div className={styles.search}>
            <Search className={styles.searchIcon} aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              placeholder={searchPlaceholder}
              className={styles.searchInput}
              aria-autocomplete="list"
              aria-controls={listboxId}
              aria-activedescendant={
                activeIndex >= 0
                  ? `${listboxId}-option-${activeIndex}`
                  : undefined
              }
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
            />
          </div>
          <ul
            ref={listboxRef}
            id={listboxId}
            role="listbox"
            className={styles.listbox}
          >
            {filteredOptions.length === 0 ? (
              <li className={styles.empty} role="presentation">
                {emptyText}
              </li>
            ) : (
              filteredOptions.map((option, index) => {
                const isActive = index === activeIndex;
                const isSelected = option.value === selectedValue;
                return (
                  <li
                    key={option.value}
                    id={`${listboxId}-option-${index}`}
                    data-index={index}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={option.disabled || undefined}
                    className={clsx(
                      styles.option,
                      isActive && styles.active,
                      isSelected && styles.selected,
                      option.disabled && styles.optionDisabled,
                    )}
                    onClick={() => {
                      if (option.disabled) return;
                      selectOption(option.value);
                    }}
                  >
                    {option.label}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}

      {helperText && !isInvalid && (
        <p id={helperId} className={styles.helper}>
          {helperText}
        </p>
      )}
      {isInvalid && errorText && (
        <p id={errorId} className={styles.error} role="alert">
          {errorText}
        </p>
      )}

      {name && (
        <input
          type="hidden"
          name={name}
          value={selectedValue}
          required={required}
        />
      )}
    </div>
  );
}

function findNextEnabled(
  options: ComboboxOption[],
  from: number,
  step: 1 | -1,
): number {
  const len = options.length;
  if (len === 0) return -1;
  let index = from + step;
  while (index >= 0 && index < len) {
    if (!options[index].disabled) return index;
    index += step;
  }
  return -1;
}
