"use client";

import { useCallback, useId, useState } from "react";
import type { ReactNode } from "react";
import { format, isValid, parse } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import clsx from "clsx";
import { Popover } from "../Popover";
import { Calendar } from "../Calendar";
import styles from "./DatePicker.module.scss";

export interface DatePickerProps {
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (date: Date | null) => void;
  placeholder?: string;
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

export function DatePicker({
  value,
  defaultValue = null,
  onValueChange,
  placeholder = "Select a date",
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
}: DatePickerProps) {
  const generatedId = useId();
  const pickerId = id ?? generatedId;
  const helperId = helperText ? `${pickerId}-helper` : undefined;
  const errorId = errorText ? `${pickerId}-error` : undefined;
  const describedBy =
    [helperId, errorId].filter(Boolean).join(" ") || undefined;
  const isInvalid = invalid || Boolean(errorText);

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<Date | null>(defaultValue);
  const selectedDate = isControlled ? value : internalValue;
  const [open, setOpen] = useState(false);

  const handleSelect = useCallback(
    (date: Date) => {
      if (!isControlled) setInternalValue(date);
      onValueChange?.(date);
      setOpen(false);
    },
    [isControlled, onValueChange],
  );

  const handleClear = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      if (!isControlled) setInternalValue(null);
      onValueChange?.(null);
    },
    [isControlled, onValueChange],
  );

  const displayText = selectedDate && isValid(selectedDate)
    ? format(selectedDate, dateFormat)
    : placeholder;
  const showClear = clearable && selectedDate && !disabled;
  const hiddenValue = selectedDate && isValid(selectedDate)
    ? format(selectedDate, "yyyy-MM-dd")
    : "";

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
        ariaLabel="Choose date"
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
            <span
              className={styles.triggerText}
              data-placeholder={!selectedDate}
            >
              {displayText}
            </span>
            {showClear && (
              <span
                role="button"
                tabIndex={-1}
                aria-label="Clear date"
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
          mode="single"
          selected={selectedDate}
          defaultMonth={selectedDate ?? undefined}
          minDate={minDate}
          maxDate={maxDate}
          disabledDates={disabledDates}
          disabled={disabled}
          onSelect={handleSelect}
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
        <input type="hidden" name={name} value={hiddenValue} required={required} />
      )}
    </div>
  );
}

export { isValid, parse };
