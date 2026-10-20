"use client";

import { useCallback, useId } from "react";
import type { ReactNode } from "react";
import { GitCompare } from "lucide-react";
import clsx from "clsx";
import { Combobox } from "../../ui/Combobox";
import type { ComboboxOption } from "../../ui/Combobox";
import { Select } from "../../ui/Select";
import type { SelectOption } from "../../ui/Select";
import styles from "./ComparisonSelector.module.scss";

/**
 * The dimension along which a comparison is made.
 * - "period": compare across time ranges (e.g. term vs previous term).
 * - "cohort": compare across groups (e.g. class vs class).
 */
export type ComparisonDimension = "period" | "cohort";

export interface ComparisonSelectorProps {
  /** Which dimension is being compared. Drives labels. */
  dimension?: ComparisonDimension;
  /** Options for the comparison target (period or cohort). */
  options: ComboboxOption[];
  /** Controlled selected comparison value. Empty string = no comparison. */
  value?: string;
  /** Initial value for uncontrolled usage. */
  defaultValue?: string;
  /** Emitted with the selected value, or "" when no comparison is chosen. */
  onValueChange?: (value: string) => void;
  /** Label for the comparison field. */
  label?: ReactNode;
  /** Label for the "no comparison" option. */
  noneLabel?: string;
  /** Helper text shown below the control. */
  helperText?: ReactNode;
  /** Render as a native Select instead of a searchable Combobox. */
  nativeSelect?: boolean;
  /** Disable the control. */
  disabled?: boolean;
  /** Show the control in an invalid state. */
  invalid?: boolean;
  /** Error text shown when invalid. */
  errorText?: ReactNode;
  className?: string;
}

const NO_COMPARISON_VALUE = "";

export function ComparisonSelector({
  dimension = "period",
  options,
  value,
  defaultValue,
  onValueChange,
  label,
  noneLabel = "No comparison",
  helperText,
  nativeSelect = false,
  disabled = false,
  invalid = false,
  errorText,
  className,
}: ComparisonSelectorProps) {
  const labelId = useId();
  const computedLabel =
    label ?? (dimension === "period" ? "Compare period" : "Compare cohort");

  const handleValueChange = useCallback(
    (next: string) => {
      onValueChange?.(next);
    },
    [onValueChange],
  );

  // Build the option list with an explicit "no comparison" entry so the
  // none-state is a first-class, selectable option rather than a hidden
  // default.
  const fullOptions: ComboboxOption[] = [
    { value: NO_COMPARISON_VALUE, label: noneLabel },
    ...options,
  ];

  const selectOptions: SelectOption[] = fullOptions.map((o) => ({
    value: o.value,
    label: o.label,
    disabled: o.disabled,
  }));

  const isActive = value !== undefined && value !== NO_COMPARISON_VALUE;

  return (
    <div
      className={clsx(styles.container, className)}
      data-active={isActive || undefined}
    >
      {nativeSelect ? (
        <div className={styles.field}>
          <span id={labelId} className={styles.label}>
            <GitCompare className={styles.labelIcon} aria-hidden="true" />
            {computedLabel}
          </span>
          <Select
            options={selectOptions}
            value={value}
            defaultValue={defaultValue}
            onChange={(e) => handleValueChange(e.target.value)}
            disabled={disabled}
            invalid={invalid}
            aria-labelledby={labelId}
            aria-describedby={errorText ? `${labelId}-error` : undefined}
          />
        </div>
      ) : (
        <Combobox
          options={fullOptions}
          value={value}
          defaultValue={defaultValue}
          onValueChange={handleValueChange}
          label={
            <span className={styles.labelInner}>
              <GitCompare className={styles.labelIcon} aria-hidden="true" />
              {computedLabel}
            </span>
          }
          helperText={helperText}
          errorText={errorText}
          invalid={invalid}
          disabled={disabled}
          clearable={false}
          placeholder={noneLabel}
        />
      )}
      {errorText && nativeSelect && (
        <p id={`${labelId}-error`} className={styles.error} role="alert">
          {errorText}
        </p>
      )}
    </div>
  );
}
