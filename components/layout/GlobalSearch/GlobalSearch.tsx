"use client";

import { useId, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { Search } from "lucide-react";
import { Input } from "../../ui/Input";
import clsx from "clsx";
import type { SearchSuggestion } from "../headerTypes";
import styles from "./GlobalSearch.module.scss";

export interface GlobalSearchProps {
  value?: string;
  defaultValue?: string;
  onQueryChange?: (query: string) => void;
  onSelectSuggestion?: (suggestion: SearchSuggestion) => void;
  onSubmit?: (query: string) => void;
  suggestions?: SearchSuggestion[];
  placeholder?: string;
  emptyText?: string;
  ariaLabel?: string;
  className?: string;
}

export function GlobalSearch({
  value,
  defaultValue = "",
  onQueryChange,
  onSelectSuggestion,
  onSubmit,
  suggestions = [],
  placeholder = "Search\u2026",
  emptyText = "No results",
  ariaLabel = "Global search",
  className,
}: GlobalSearchProps) {
  const generatedId = useId();
  const listboxId = `${generatedId}-listbox`;
  const containerRef = useRef<HTMLDivElement>(null);
  const [internalQuery, setInternalQuery] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const isControlled = value !== undefined;
  const query = isControlled ? value : internalQuery;

  const trimmed = query.trim().toLowerCase();
  const visibleSuggestions =
    trimmed.length === 0
      ? suggestions
      : suggestions.filter((s) =>
          typeof s.label === "string"
            ? s.label.toLowerCase().includes(trimmed)
            : true,
        );

  const setQuery = (next: string) => {
    if (!isControlled) setInternalQuery(next);
    onQueryChange?.(next);
    setOpen(true);
    setActiveIndex(visibleSuggestions.length > 0 ? 0 : -1);
  };

  const choose = (suggestion: SearchSuggestion) => {
    onSelectSuggestion?.(suggestion);
    setOpen(false);
    setActiveIndex(-1);
  };

  const submit = () => {
    if (query.trim().length === 0) return;
    onSubmit?.(query.trim());
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "ArrowDown":
        if (open && visibleSuggestions.length > 0) {
          event.preventDefault();
          setActiveIndex((prev) =>
            prev + 1 >= visibleSuggestions.length ? 0 : prev + 1,
          );
        }
        break;
      case "ArrowUp":
        if (open && visibleSuggestions.length > 0) {
          event.preventDefault();
          setActiveIndex((prev) =>
            prev - 1 < 0 ? visibleSuggestions.length - 1 : prev - 1,
          );
        }
        break;
      case "Enter":
        event.preventDefault();
        if (open && activeIndex >= 0 && visibleSuggestions[activeIndex]) {
          choose(visibleSuggestions[activeIndex]);
        } else {
          submit();
        }
        break;
      case "Escape":
        if (open) {
          event.preventDefault();
          setOpen(false);
          setActiveIndex(-1);
        }
        break;
      default:
        break;
    }
  };

  // Close on outside pointer down.
  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!containerRef.current?.contains(event.relatedTarget as Node)) {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div
      ref={containerRef}
      className={clsx(styles.container, className)}
      onBlur={handleBlur}
    >
      <Input
        type="search"
        inputSize="md"
        value={query}
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-expanded={open && visibleSuggestions.length > 0}
        aria-controls={open ? listboxId : undefined}
        aria-autocomplete="list"
        aria-activedescendant={
          open && activeIndex >= 0
            ? `${listboxId}-option-${activeIndex}`
            : undefined
        }
        leadingIcon={<Search aria-hidden="true" />}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (visibleSuggestions.length > 0) setOpen(true);
        }}
        className={styles.input}
      />

      {open && visibleSuggestions.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          className={styles.listbox}
        >
          {visibleSuggestions.map((suggestion, index) => (
            <li
              key={suggestion.id}
              id={`${listboxId}-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              className={clsx(
                styles.option,
                index === activeIndex && styles.active,
              )}
              onMouseDown={(e) => {
                e.preventDefault();
                choose(suggestion);
              }}
              onMouseEnter={() => setActiveIndex(index)}
            >
              {suggestion.icon && (
                <span className={styles.icon} aria-hidden="true">
                  {suggestion.icon}
                </span>
              )}
              <span className={styles.optionContent}>
                <span className={styles.optionLabel}>{suggestion.label}</span>
                {suggestion.description && (
                  <span className={styles.optionDescription}>
                    {suggestion.description}
                  </span>
                )}
              </span>
              {suggestion.group && (
                <span className={styles.group}>{suggestion.group}</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {open &&
        visibleSuggestions.length === 0 &&
        trimmed.length > 0 && (
          <p className={styles.empty} role="status">
            {emptyText}
          </p>
        )}
    </div>
  );
}

export type { SearchSuggestion } from "../headerTypes";

export type GlobalSearchComponentProps = GlobalSearchProps & {
  children?: ReactNode;
};
