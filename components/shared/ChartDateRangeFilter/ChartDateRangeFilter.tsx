"use client";

import { useCallback, useId, useMemo } from "react";
import type { ReactNode } from "react";
import { format, isSameDay } from "date-fns";
import { CalendarRange } from "lucide-react";
import clsx from "clsx";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import type { CalendarDateRange } from "@/components/ui/Calendar";
import { Button } from "@/components/ui/Button";
import styles from "./ChartDateRangeFilter.module.scss";

/**
 * A single quick-range preset. The `range` factory returns the
 * concrete start/end to apply when the preset is chosen; callers
 * supply these so no academic calendar dates are hard-coded here.
 */
export interface ChartDateRangePreset {
  id: string;
  label: ReactNode;
  range: () => CalendarDateRange;
}

export interface ChartDateRangeFilterProps {
  /** Controlled selected range. */
  value?: CalendarDateRange;
  /** Initial range for uncontrolled usage. */
  defaultValue?: CalendarDateRange;
  /** Emitted on any range change (preset or manual calendar pick). */
  onRangeChange?: (range: CalendarDateRange) => void;
  /** Quick-select presets supplied by the caller. */
  presets?: ChartDateRangePreset[];
  /** Optional label for the date-range field. */
  label?: ReactNode;
  /** Allow clearing the range from the picker. */
  clearable?: boolean;
  /** Disable the entire control. */
  disabled?: boolean;
  /** Pass-through for form wiring. */
  name?: string;
  className?: string;
}

function isRangeEmpty(range: CalendarDateRange | undefined): boolean {
  return !range || (!range.start && !range.end);
}

function rangesEqual(
  a: CalendarDateRange | undefined,
  b: CalendarDateRange | undefined,
): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;
  const startEq =
    !!a.start && !!b.start
      ? isSameDay(a.start, b.start)
      : !a.start && !b.start;
  const endEq =
    !!a.end && !!b.end ? isSameDay(a.end, b.end) : !a.end && !b.end;
  return startEq && endEq;
}

export function ChartDateRangeFilter({
  value,
  defaultValue,
  onRangeChange,
  presets,
  label = "Date range",
  clearable = true,
  disabled = false,
  name,
  className,
}: ChartDateRangeFilterProps) {
  const listId = useId();

  const activePresetId = useMemo(() => {
    if (!presets || presets.length === 0) return null;
    if (isRangeEmpty(value)) return null;
    const match = presets.find((p) => rangesEqual(value, p.range()));
    return match?.id ?? null;
  }, [presets, value]);

  const handlePreset = useCallback(
    (preset: ChartDateRangePreset) => {
      if (disabled) return;
      const next = preset.range();
      onRangeChange?.(next);
    },
    [disabled, onRangeChange],
  );

  const summaryText = useMemo(() => {
    if (isRangeEmpty(value)) return null;
    if (value!.start && value!.end) {
      return `${format(value!.start, "MMM d, yyyy")} – ${format(
        value!.end,
        "MMM d, yyyy",
      )}`;
    }
    if (value!.start) return `From ${format(value!.start, "MMM d, yyyy")}`;
    if (value!.end) return `Until ${format(value!.end, "MMM d, yyyy")}`;
    return null;
  }, [value]);

  return (
    <div className={clsx(styles.container, disabled && styles.disabled, className)}>
      <div className={styles.top}>
        <DateRangePicker
          value={value}
          defaultValue={defaultValue}
          onRangeChange={onRangeChange}
          label={label}
          clearable={clearable}
          disabled={disabled}
          name={name}
        />
        {summaryText && (
          <p className={styles.summary} aria-live="polite">
            <CalendarRange className={styles.summaryIcon} aria-hidden="true" />
            {summaryText}
          </p>
        )}
      </div>

      {presets && presets.length > 0 && (
        <div
          className={styles.presets}
          role="group"
          aria-describedby={listId}
        >
          <span id={listId} className={styles.presetsLabel}>
            Quick ranges
          </span>
          <div className={styles.presetList}>
            {presets.map((preset) => {
              const isActive = activePresetId === preset.id;
              return (
                <Button
                  key={preset.id}
                  variant="ghost"
                  size="sm"
                  className={clsx(styles.preset, isActive && styles.presetActive)}
                  aria-pressed={isActive}
                  disabled={disabled}
                  onClick={() => handlePreset(preset)}
                >
                  {preset.label}
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}


