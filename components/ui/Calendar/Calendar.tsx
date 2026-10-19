"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isValid,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import styles from "./Calendar.module.scss";

export type CalendarMode = "single" | "range";

export interface CalendarDateRange {
  start: Date | null;
  end: Date | null;
}

export interface CalendarProps {
  mode?: CalendarMode;
  selected?: Date | null;
  selectedRange?: CalendarDateRange;
  defaultMonth?: Date;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  disabled?: boolean;
  onSelect?: (date: Date) => void;
  onRangeChange?: (range: CalendarDateRange) => void;
  onMonthChange?: (month: Date) => void;
  className?: string;
  weekStartsOn?: 0 | 1;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function Calendar({
  mode = "single",
  selected,
  selectedRange,
  defaultMonth,
  minDate,
  maxDate,
  disabledDates = [],
  disabled = false,
  onSelect,
  onRangeChange,
  onMonthChange,
  className,
  weekStartsOn = 0,
}: CalendarProps) {
  const [viewMonth, setViewMonth] = useState<Date>(
    () => defaultMonth ?? selected ?? new Date(),
  );
  const gridRef = useRef<HTMLDivElement>(null);
  const [focusedDate, setFocusedDate] = useState<Date>(
    () => selected ?? defaultMonth ?? new Date(),
  );

  const days = useMemo(() => {
    const monthStart = startOfMonth(viewMonth);
    const monthEnd = endOfMonth(viewMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [viewMonth, weekStartsOn]);

  const isDateDisabled = useCallback(
    (date: Date): boolean => {
      if (disabled) return true;
      if (minDate && isBefore(date, startOfDay(minDate))) return true;
      if (maxDate && isAfter(date, endOfDay(maxDate))) return true;
      if (disabledDates.some((d) => isSameDay(date, d))) return true;
      return false;
    },
    [disabled, minDate, maxDate, disabledDates],
  );

  const isDateInRange = useCallback(
    (date: Date): boolean => {
      if (mode !== "range" || !selectedRange) return false;
      const { start, end } = selectedRange;
      if (!start) return false;
      if (!end) return false;
      return (
        (isAfter(date, start) || isSameDay(date, start)) &&
        (isBefore(date, end) || isSameDay(date, end))
      );
    },
    [mode, selectedRange],
  );

  const isRangeStart = useCallback(
    (date: Date): boolean => {
      if (mode !== "range" || !selectedRange?.start) return false;
      return isSameDay(date, selectedRange.start);
    },
    [mode, selectedRange],
  );

  const isRangeEnd = useCallback(
    (date: Date): boolean => {
      if (mode !== "range" || !selectedRange?.end) return false;
      return isSameDay(date, selectedRange.end);
    },
    [mode, selectedRange],
  );

  const handleSelect = useCallback(
    (date: Date) => {
      if (isDateDisabled(date)) return;

      if (mode === "single") {
        onSelect?.(date);
        return;
      }

      // range mode
      const currentRange = selectedRange ?? { start: null, end: null };
      if (!currentRange.start || (currentRange.start && currentRange.end)) {
        onRangeChange?.({ start: date, end: null });
      } else {
        if (isBefore(date, currentRange.start)) {
          onRangeChange?.({ start: date, end: currentRange.start });
        } else {
          onRangeChange?.({ start: currentRange.start, end: date });
        }
      }
    },
    [mode, selectedRange, isDateDisabled, onSelect, onRangeChange],
  );

  const changeMonth = useCallback(
    (delta: number) => {
      const next = delta > 0 ? addMonths(viewMonth, 1) : subMonths(viewMonth, 1);
      setViewMonth(next);
      onMonthChange?.(next);
      setFocusedDate(next);
    },
    [viewMonth, onMonthChange],
  );

  const navigate = useCallback(
    (date: Date) => {
      if (isDateDisabled(date)) return;
      setFocusedDate(date);
      if (!isSameMonth(date, viewMonth)) {
        setViewMonth(startOfMonth(date));
        onMonthChange?.(startOfMonth(date));
      }
    },
    [isDateDisabled, viewMonth, onMonthChange],
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    let next: Date | null = null;
    switch (event.key) {
      case "ArrowRight":
        next = addDays(focusedDate, 1);
        break;
      case "ArrowLeft":
        next = addDays(focusedDate, -1);
        break;
      case "ArrowDown":
        next = addDays(focusedDate, 7);
        break;
      case "ArrowUp":
        next = addDays(focusedDate, -7);
        break;
      case "Home":
        next = startOfWeek(focusedDate, { weekStartsOn });
        break;
      case "End":
        next = endOfWeek(focusedDate, { weekStartsOn });
        break;
      case "PageUp":
        next = subMonths(focusedDate, 1);
        break;
      case "PageDown":
        next = addMonths(focusedDate, 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        handleSelect(focusedDate);
        return;
      default:
        return;
    }
    if (next) {
      event.preventDefault();
      navigate(next);
    }
  };

  const weekdayLabels = useMemo(() => {
    const arr = [...WEEKDAYS];
    if (weekStartsOn === 1) {
      arr.push(arr.shift() as string);
    }
    return arr;
  }, [weekStartsOn]);

  return (
    <div
      ref={gridRef}
      className={clsx(styles.calendar, disabled && styles.disabled, className)}
      role="grid"
      aria-label={`Calendar, ${format(viewMonth, "MMMM yyyy")}`}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.header}>
        <button
          type="button"
          className={styles.navButton}
          aria-label="Previous month"
          onClick={() => changeMonth(-1)}
          disabled={disabled}
          data-autofocus
        >
          <ChevronLeft aria-hidden="true" />
        </button>
        <span className={styles.monthLabel} aria-live="polite">
          {format(viewMonth, "MMMM yyyy")}
        </span>
        <button
          type="button"
          className={styles.navButton}
          aria-label="Next month"
          onClick={() => changeMonth(1)}
          disabled={disabled}
        >
          <ChevronRight aria-hidden="true" />
        </button>
      </div>

      <div className={styles.weekdays} role="row">
        {weekdayLabels.map((day) => (
          <span
            key={day}
            className={styles.weekday}
            role="columnheader"
            aria-label={day}
          >
            {day.charAt(0)}
          </span>
        ))}
      </div>

      <div className={styles.days} role="rowgroup">
        {days.map((date) => {
          const isCurrentMonth = isSameMonth(date, viewMonth);
          const isDisabled = isDateDisabled(date);
          const isFocused = isSameDay(date, focusedDate);
          const isSelected =
            mode === "single" && selected
              ? isSameDay(date, selected)
              : false;
          const inRange = isDateInRange(date);
          const isRStart = isRangeStart(date);
          const isREnd = isRangeEnd(date);
          const dayLabel = format(date, "d");
          const fullLabel = format(date, "EEEE, MMMM d, yyyy");

          return (
            <button
              key={date.toISOString()}
              type="button"
              role="gridcell"
              tabIndex={isFocused ? 0 : -1}
              disabled={isDisabled}
              aria-selected={isSelected || isRStart || isREnd || undefined}
              aria-disabled={isDisabled || undefined}
              aria-label={fullLabel}
              data-current-month={isCurrentMonth || undefined}
              data-today={isSameDay(date, new Date()) || undefined}
              className={clsx(
                styles.day,
                !isCurrentMonth && styles.outsideMonth,
                isDisabled && styles.dayDisabled,
                isSelected && styles.selected,
                inRange && styles.inRange,
                isRStart && styles.rangeStart,
                isREnd && styles.rangeEnd,
              )}
              onClick={() => handleSelect(date)}
              onFocus={() => setFocusedDate(date)}
            >
              {dayLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export { isValid };
