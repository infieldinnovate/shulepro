"use client";

import { useCallback, useId, useState } from "react";
import type { ReactNode } from "react";
import { format, isValid } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import clsx from "clsx";
import { Popover } from "../Popover";
import { Calendar } from "../Calendar";
import type { CalendarDateRange } from "../Calendar";
import styles from "./DateRangePicker.module.scss";

export interface DateRangePickerProps {
  value?: CalendarDateRange;
  defaultValue?: CalendarDateRange;
  onRangeChange?: (range: CalendarDateRange) => void;
  startPlaceholder?: string;
  endPlaceholder?: string;
  dateFormat?: string;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
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
  weekStartsOn?: 0 | 1;
}

const EMPTY_RANGE: CalendarDateRange = { start: null, end: null };

export function DateRangePicker({
  value,
  defaultValue = EMPTY_RANGE,
  onRangeChange,
  startPlaceholder = "Start date",
  endPlaceholder = "End date",
  dateFormat = "MMM d, yyyy",
  minDate,
  maxDate,
  disabledDates,
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
  weekStartsOn,
}: DateRangePickerProps) {
  const generatedId = useId();
  const pickerId = id ?? generatedId;
  const helperId = helperText ? `${pickerId}-helper` : undefined;
  const errorId = errorText ? `${pickerId}-error` : undefined;
  const describedBy =
    [helperId, errorId].filter(Boolean).join(" ") || undefined;
  const isInvalid = invalid || Boolean(errorText);

  const isControlled = value !== undefined;
  const [internalRange, setInternalRange] =
    useState<CalendarDateRange>(defaultValue);
  const range = isControlled ? value : internalRange;
  const [open, setOpen] = useState(false);

  const handleRangeChange = useCallback(
    (next: CalendarDateRange) => {
      if (!isControlled) setInternalRange(next);
      onRangeChange?.(next);
      if (next.start && next.end) {
        setOpen(false);
      }
    },
    [isControlled, onRangeChange],
  );

  const handleClear = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      if (!isControlled) setInternalRange(EMPTY_RANGE);
      onRangeChange?.(EMPTY_RANGE);
    },
    [isControlled, onRangeChange],
  );

  const startText =
    range.start && isValid(range.start)
      ? format(range.start, dateFormat)
      : startPlaceholder;
  const endText =
    range.end && isValid(range.end)
      ? format(range.end, dateFormat)
      : endPlaceholder;
  const showClear =
    clearable && (range.start || range.end) && !disabled;

  const startHidden =
    range.start && isValid(range.start) ? format(range.start, "yyyy-MM-dd") : "";
  const endHidden =
    range.end && isValid(range.end) ? format(range.end, "yyyy-MM-dd") : "";

  return (
    <div
      className={clsx(
        styles.container,
        isInvalid && styles.invalid,
        disabled && styles.disabled,
        className,
      )}
    >
      {label && (
        <span className={styles.label}>
          {label}
          {required && (
            <span className={styles.requiredMark} aria-hidden="true">
              *
            </span>
          )}
        </span>
      )}
      <Popover
        open={open}
        onOpenChange={setOpen}
        disabled={disabled}
        ariaLabel="Choose date range"
        className={styles.popoverAnchor}
        contentClassName={styles.popoverContent}
        trigger={
          <button
            id={pickerId}
            type="button"
            disabled={disabled}
            aria-describedby={describedBy}
            aria-haspopup="dialog"
            aria-expanded={open}
            className={styles.trigger}
          >
            <CalendarIcon className={styles.calendarIcon} aria-hidden="true" />
            <span className={styles.rangeFields}>
              <span
                className={styles.rangeText}
                data-placeholder={!range.start}
              >
                {startText}
              </span>
              <span className={styles.separator} aria-hidden="true">
                –
              </span>
              <span
                className={styles.rangeText}
                data-placeholder={!range.end}
              >
                {endText}
              </span>
            </span>
            {showClear && (
              <span
                role="button"
                tabIndex={-1}
                aria-label="Clear date range"
                className={styles.clearButton}
                onClick={handleClear}
              >
                <X className={styles.clearIcon} aria-hidden="true" />
              </span>
            )}
          </button>
        }
      >
        <Calendar
          mode="range"
          selectedRange={range}
          defaultMonth={range.start ?? undefined}
          minDate={minDate}
          maxDate={maxDate}
          disabledDates={disabledDates}
          disabled={disabled}
          onRangeChange={handleRangeChange}
          weekStartsOn={weekStartsOn}
        />
      </Popover>

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
        <>
          <input
            type="hidden"
            name={`${name}-start`}
            value={startHidden}
            required={required}
          />
          <input
            type="hidden"
            name={`${name}-end`}
            value={endHidden}
            required={required}
          />
        </>
      )}
    </div>
  );
}

export { isValid };
