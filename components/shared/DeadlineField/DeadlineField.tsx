"use client";

import { useId } from "react";
import type { ReactNode } from "react";
import { Clock, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2 } from "lucide-react";
import clsx from "clsx";
import { DatePicker } from "@/components/ui/DatePicker";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { Badge } from "@/components/ui/Badge";
import type { CalendarDateRange } from "@/components/ui/Calendar";
import styles from "./DeadlineField.module.scss";

export type DeadlineValue = Date | null;
export type DeadlineRangeValue = CalendarDateRange;

export interface DeadlineFieldProps {
  value: DeadlineValue | DeadlineRangeValue;
  onValueChange: (value: DeadlineValue | DeadlineRangeValue) => void;
  /** Select a date range instead of a single date. */
  range?: boolean;
  minDate?: Date;
  maxDate?: Date;
  /** Show a time input alongside the date picker. */
  includeTime?: boolean;
  status?: "on-track" | "due-soon" | "overdue";
  disabled?: boolean;
  invalid?: boolean;
  errorText?: ReactNode;
  helperText?: ReactNode;
  label?: ReactNode;
  placeholder?: string;
  timeLabel?: string;
  startPlaceholder?: string;
  endPlaceholder?: string;
  className?: string;
  id?: string;
}

const STATUS_CONFIG: Record<
  NonNullable<DeadlineFieldProps["status"]>,
  {
    variant: "success" | "warning" | "error";
    label: string;
    icon: ReactNode;
  }
> = {
  "on-track": {
    variant: "success",
    label: "On track",
    icon: <CheckCircle2 aria-hidden="true" />,
  },
  "due-soon": {
    variant: "warning",
    label: "Due soon",
    icon: <Clock aria-hidden="true" />,
  },
  overdue: {
    variant: "error",
    label: "Overdue",
    icon: <AlertTriangle aria-hidden="true" />,
  },
};

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

function dateToTimeValue(date: Date | null | undefined): string {
  if (!date) return "";
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function DeadlineField({
  value,
  onValueChange,
  range = false,
  minDate,
  maxDate,
  includeTime = false,
  status,
  disabled = false,
  invalid = false,
  errorText,
  helperText,
  label,
  placeholder = "Select date",
  timeLabel = "Time",
  startPlaceholder = "Start date",
  endPlaceholder = "End date",
  className,
  id,
}: DeadlineFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const timeId = `${fieldId}-time`;
  const errorId = errorText ? `${fieldId}-error` : undefined;

  const handleTimeChange = (timeStr: string) => {
    if (range) {
      const rangeVal = (value as DeadlineRangeValue) ?? {
        start: null,
        end: null,
      };
      // Apply time to the end date if present, otherwise start.
      const target = rangeVal.end ?? rangeVal.start;
      if (!target) return;
      const match = timeStr.match(TIME_PATTERN);
      if (!match) return;
      const [h, m] = match.slice(1).map(Number);
      const next = new Date(target);
      next.setHours(h, m, 0, 0);
      const nextRange: CalendarDateRange =
        rangeVal.end != null
          ? { start: rangeVal.start, end: next }
          : { start: next, end: rangeVal.end };
      onValueChange(nextRange);
    } else {
      const dateVal = (value as DeadlineValue) ?? null;
      if (!dateVal) return;
      const match = timeStr.match(TIME_PATTERN);
      if (!match) return;
      const [h, m] = match.slice(1).map(Number);
      const next = new Date(dateVal);
      next.setHours(h, m, 0, 0);
      onValueChange(next);
    }
  };

  const currentTime = range
    ? dateToTimeValue(
        ((value as DeadlineRangeValue) ?? { start: null, end: null }).end ??
          ((value as DeadlineRangeValue) ?? { start: null, end: null }).start,
      )
    : dateToTimeValue(value as DeadlineValue);

  const statusConfig = status ? STATUS_CONFIG[status] : null;

  return (
    <div
      className={clsx(
        styles.container,
        invalid && styles.invalid,
        className,
      )}
    >
      {label && <span className={styles.label}>{label}</span>}

      <div className={styles.fields}>
        {range ? (
          <div className={styles.datePart}>
            <DateRangePicker
              value={(value as DeadlineRangeValue) ?? undefined}
              onRangeChange={(r) => onValueChange(r)}
              minDate={minDate}
              maxDate={maxDate}
              disabled={disabled}
              invalid={invalid}
              errorText={errorText}
              startPlaceholder={startPlaceholder}
              endPlaceholder={endPlaceholder}
              id={fieldId}
            />
          </div>
        ) : (
          <div className={styles.datePart}>
            <DatePicker
              value={(value as DeadlineValue) ?? undefined}
              onValueChange={(d) => onValueChange(d ?? null)}
              minDate={minDate}
              maxDate={maxDate}
              disabled={disabled}
              invalid={invalid}
              placeholder={placeholder}
              id={fieldId}
            />
          </div>
        )}

        {includeTime && (
          <div className={styles.timePart}>
            <label htmlFor={timeId} className={styles.timeLabel}>
              <Clock aria-hidden="true" />
              <span>{timeLabel}</span>
            </label>
            <input
              id={timeId}
              type="time"
              value={currentTime}
              disabled={disabled}
              aria-describedby={errorId}
              className={styles.timeInput}
              onChange={(e) => handleTimeChange(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className={styles.footer}>
        {statusConfig && (
          <Badge
            variant={statusConfig.variant}
            size="sm"
            dot
            icon={statusConfig.icon}
          >
            {statusConfig.label}
          </Badge>
        )}
        {helperText && !invalid && (
          <p className={styles.helper}>{helperText}</p>
        )}
        {invalid && errorText && (
          <p id={errorId} className={styles.error} role="alert">
            {errorText}
          </p>
        )}
      </div>
    </div>
  );
}
