"use client";

import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Search, X } from "lucide-react";
import clsx from "clsx";
import { Combobox } from "../../../ui/Combobox";
import { Checkbox } from "../../../ui/Checkbox";
import { Spinner } from "../../../ui/Spinner";
import { EmptyState } from "../../../ui/EmptyState";
import { IconButton } from "../../../ui/Button";
import type { LearningArea } from "../types";
import styles from "./LearningAreaSelector.module.scss";

export interface LearningAreaSelectorProps {
  learningAreas: LearningArea[];
  /** For single-select mode. */
  value?: string;
  /** For multi-select mode. */
  selectedIds?: string[];
  onValueChange?: (value: string) => void;
  onSelectionChange?: (ids: string[]) => void;
  multiple?: boolean;
  searchable?: boolean;
  disabled?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  loading?: boolean;
  label?: ReactNode;
  helperText?: ReactNode;
  ariaLabel?: string;
  className?: string;
}

export function LearningAreaSelector({
  learningAreas,
  value,
  selectedIds = [],
  onValueChange,
  onSelectionChange,
  multiple = false,
  searchable = true,
  disabled = false,
  placeholder = "Select learning area",
  searchPlaceholder = "Search learning areas\u2026",
  emptyText = "No learning areas found",
  loading = false,
  label,
  helperText,
  ariaLabel = "Learning areas",
  className,
}: LearningAreaSelectorProps) {
  const [query, setQuery] = useState("");

  const selected = useMemo(
    () =>
      selectedIds
        .map((id) => learningAreas.find((la) => la.id === id))
        .filter((la): la is LearningArea => la != null),
    [learningAreas, selectedIds],
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return learningAreas;
    return learningAreas.filter((la) => {
      const label = la.label.toLowerCase();
      const code = la.code?.toLowerCase();
      const group = la.group?.toLowerCase();
      return (
        label.includes(normalized) ||
        (code != null && code.includes(normalized)) ||
        (group != null && group.includes(normalized))
      );
    });
  }, [learningAreas, query]);

  const toggle = useCallback(
    (id: string) => {
      if (disabled) return;
      const next = selectedIds.includes(id)
        ? selectedIds.filter((s) => s !== id)
        : [...selectedIds, id];
      onSelectionChange?.(next);
    },
    [disabled, selectedIds, onSelectionChange],
  );

  const removeSelected = useCallback(
    (id: string) => {
      if (disabled) return;
      onSelectionChange?.(selectedIds.filter((s) => s !== id));
    },
    [disabled, selectedIds, onSelectionChange],
  );

  if (loading) {
    return (
      <div className={clsx(styles.loading, className)}>
        <Spinner size="sm" label="Loading learning areas" />
      </div>
    );
  }

  if (learningAreas.length === 0) {
    return (
      <EmptyState
        title={emptyText}
        className={clsx(styles.empty, className)}
      />
    );
  }

  // ---- Single-select: Combobox ----
  if (!multiple) {
    const options = learningAreas.map((la) => ({
      value: la.id,
      label: la.code ? `${la.label} (${la.code})` : la.label,
      disabled: la.disabled,
    }));
    return (
      <div className={clsx(styles.container, className)}>
        {label && <span className={styles.label}>{label}</span>}
        <Combobox
          options={options}
          value={value}
          onValueChange={onValueChange}
          placeholder={placeholder}
          searchPlaceholder={searchPlaceholder}
          emptyText={emptyText}
          disabled={disabled}
          clearable
          aria-label={ariaLabel}
        />
        {helperText && <p className={styles.helper}>{helperText}</p>}
      </div>
    );
  }

  // ---- Multi-select: searchable checkbox list ----
  return (
    <div className={clsx(styles.container, className)}>
      {label && <span className={styles.label}>{label}</span>}

      {selected.length > 0 && (
        <ul className={styles.chipList} aria-label={`Selected ${ariaLabel}`}>
          {selected.map((la) => (
            <li key={la.id} className={styles.chip}>
              <span className={styles.chipLabel}>{la.label}</span>
              {!disabled && (
                <IconButton
                  variant="ghost"
                  size="sm"
                  label={`Remove ${la.label}`}
                  onClick={() => removeSelected(la.id)}
                  className={styles.chipRemove}
                >
                  <X aria-hidden="true" />
                </IconButton>
              )}
            </li>
          ))}
        </ul>
      )}

      {searchable && (
        <div className={styles.search}>
          <Search className={styles.searchIcon} aria-hidden="true" />
          <input
            type="search"
            value={query}
            placeholder={searchPlaceholder}
            disabled={disabled}
            aria-label={ariaLabel}
            className={styles.searchInput}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      )}

      <ul className={styles.list} role="group" aria-label={ariaLabel}>
        {filtered.length === 0 ? (
          <li className={styles.empty}>{emptyText}</li>
        ) : (
          filtered.map((la) => {
            const isSelected = selectedIds.includes(la.id);
            return (
              <li key={la.id} className={styles.option}>
                <Checkbox
                  checked={isSelected}
                  disabled={disabled || la.disabled}
                  label={
                    <span className={styles.optionContent}>
                      <span className={styles.optionText}>
                        <span className={styles.optionLabel}>{la.label}</span>
                        {la.code && (
                          <span className={styles.optionCode}>{la.code}</span>
                        )}
                        {la.group && (
                          <span className={styles.optionGroup}>{la.group}</span>
                        )}
                      </span>
                    </span>
                  }
                  onChange={() => toggle(la.id)}
                  className={styles.optionCheckbox}
                />
              </li>
            );
          })
        )}
      </ul>

      {helperText && <p className={styles.helper}>{helperText}</p>}
    </div>
  );
}
