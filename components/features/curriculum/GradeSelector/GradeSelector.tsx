"use client";

import { useMemo } from "react";
import clsx from "clsx";
import { Select } from "../../../ui/Select";
import type { SelectOption } from "../../../ui/Select";
import { Combobox } from "../../../ui/Combobox";
import { Spinner } from "../../../ui/Spinner";
import { EmptyState } from "../../../ui/EmptyState";
import type { Grade } from "../types";
import styles from "./GradeSelector.module.scss";

export interface GradeSelectorProps {
  grades: Grade[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  loading?: boolean;
  /** Accessible label. */
  ariaLabel?: string;
  className?: string;
}

const SEARCHABLE_THRESHOLD = 8;

export function GradeSelector({
  grades,
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  placeholder = "Select grade",
  searchable,
  searchPlaceholder = "Search grades\u2026",
  emptyText = "No grades available",
  loading = false,
  ariaLabel = "Grade",
  className,
}: GradeSelectorProps) {
  const options = useMemo<SelectOption[]>(
    () =>
      grades
        .slice()
        .sort((a, b) => (a.level ?? 0) - (b.level ?? 0))
        .map((g) => ({
          value: g.id,
          label: g.label,
          disabled: g.disabled,
        })),
    [grades],
  );

  const useCombobox =
    searchable ?? (options.length > SEARCHABLE_THRESHOLD);

  if (loading) {
    return (
      <div className={clsx(styles.loading, className)}>
        <Spinner size="sm" label="Loading grades" />
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <EmptyState
        title={emptyText}
        className={clsx(styles.empty, className)}
      />
    );
  }

  if (useCombobox) {
    return (
      <Combobox
        options={options}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        emptyText={emptyText}
        disabled={disabled}
        clearable
        aria-label={ariaLabel}
        className={className}
      />
    );
  }

  return (
    <Select
      options={options}
      value={value}
      defaultValue={defaultValue}
      onChange={
        onValueChange
          ? (e) => onValueChange(e.target.value)
          : undefined
      }
      disabled={disabled}
      placeholder={placeholder}
      aria-label={ariaLabel}
      className={clsx(styles.select, className)}
    />
  );
}
