"use client";

import { useMemo } from "react";
import clsx from "clsx";
import { Select } from "../../../ui/Select";
import type { SelectOption } from "../../../ui/Select";
import { Combobox } from "../../../ui/Combobox";
import { Spinner } from "../../../ui/Spinner";
import { EmptyState } from "../../../ui/EmptyState";
import type { Class } from "../types";
import styles from "./ClassSelector.module.scss";

export interface ClassSelectorProps {
  classes: Class[];
  /** When provided, only classes matching this grade are shown. */
  gradeId?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  searchable?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  loading?: boolean;
  ariaLabel?: string;
  className?: string;
}

const SEARCHABLE_THRESHOLD = 8;

export function ClassSelector({
  classes,
  gradeId,
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  searchable,
  placeholder = "Select class",
  searchPlaceholder = "Search classes\u2026",
  emptyText = "No classes available",
  loading = false,
  ariaLabel = "Class",
  className,
}: ClassSelectorProps) {
  const filteredClasses = useMemo(() => {
    if (!gradeId) return classes;
    return classes.filter((c) => c.gradeId === gradeId);
  }, [classes, gradeId]);

  const options = useMemo<SelectOption[]>(
    () =>
      filteredClasses.map((c) => ({
        value: c.id,
        label: c.room ? `${c.label} (${c.room})` : c.label,
        disabled: c.disabled,
      })),
    [filteredClasses],
  );

  const useCombobox =
    searchable ?? (options.length > SEARCHABLE_THRESHOLD);

  if (loading) {
    return (
      <div className={clsx(styles.loading, className)}>
        <Spinner size="sm" label="Loading classes" />
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
