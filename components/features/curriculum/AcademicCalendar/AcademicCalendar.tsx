"use client";

import { useCallback, useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, CalendarDays, MapPin } from "lucide-react";
import clsx from "clsx";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconButton, Button } from "@/components/ui/Button";
import { resolveChartColor } from "@/lib/chartColors";
import type { AcademicCalendarEvent, AcademicCalendarEventType } from "@/components/features/curriculum/types";
import styles from "./AcademicCalendar.module.scss";

export interface AcademicCalendarProps {
  events: AcademicCalendarEvent[];
  /** The month to display (any date within the month). */
  month: Date;
  onMonthChange?: (month: Date) => void;
  onSelectEvent?: (event: AcademicCalendarEvent) => void;
  minDate?: Date;
  maxDate?: Date;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  ariaLabel?: string;
  /** Which day the week starts on (0=Sun, 1=Mon). */
  weekStartsOn?: 0 | 1;
  className?: string;
}

const WEEKDAY_LABELS_SUN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAY_LABELS_MON = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const EVENT_TYPE_LABELS: Record<AcademicCalendarEventType, string> = {
  term: "Term",
  exam: "Exam",
  holiday: "Holiday",
  meeting: "Meeting",
  deadline: "Deadline",
  other: "Event",
};

export function AcademicCalendar({
  events,
  month,
  onMonthChange,
  onSelectEvent,
  minDate,
  maxDate,
  loading = false,
  error,
  empty = false,
  ariaLabel = "Academic calendar",
  weekStartsOn = 0,
  className,
}: AcademicCalendarProps) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const viewMonth = useMemo(() => startOfMonth(month), [month]);

  const days = useMemo(() => {
    const monthStart = startOfMonth(viewMonth);
    const monthEnd = endOfMonth(viewMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [viewMonth, weekStartsOn]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, AcademicCalendarEvent[]>();
    for (const event of events) {
      // Only index events that overlap the current view month
      for (const day of days) {
        if (!isSameMonth(day, viewMonth)) continue;
        const inRange = event.endDate
          ? isWithinInterval(day, {
              start: event.date,
              end: event.endDate,
            })
          : isSameDay(day, event.date);
        if (inRange) {
          const key = day.toISOString();
          const list = map.get(key) ?? [];
          list.push(event);
          map.set(key, list);
        }
      }
    }
    return map;
  }, [events, days, viewMonth]);

  // Agenda: events within the current month, sorted by date
  const monthAgenda = useMemo(() => {
    return events
      .filter((e) => isSameMonth(e.date, viewMonth))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [events, viewMonth]);

  const weekdayLabels = weekStartsOn === 1 ? WEEKDAY_LABELS_MON : WEEKDAY_LABELS_SUN;

  const handlePrevMonth = useCallback(() => {
    onMonthChange?.(subMonths(viewMonth, 1));
  }, [viewMonth, onMonthChange]);

  const handleNextMonth = useCallback(() => {
    onMonthChange?.(addMonths(viewMonth, 1));
  }, [viewMonth, onMonthChange]);

  const handleSelectEvent = useCallback(
    (event: AcademicCalendarEvent) => {
      setSelectedEventId(event.id);
      onSelectEvent?.(event);
    },
    [onSelectEvent],
  );

  const isDateDisabled = useCallback(
    (date: Date): boolean => {
      if (minDate && date < startOfMonth(minDate)) return true;
      if (maxDate && date > endOfMonth(maxDate)) return true;
      return false;
    },
    [minDate, maxDate],
  );

  if (loading) {
    return (
      <div className={clsx(styles.loading, className)}>
        <Spinner size="md" label="Loading calendar" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        variant="error"
        title="Unable to load calendar"
        description={error}
        className={className}
      />
    );
  }

  if (empty || events.length === 0) {
    return (
      <EmptyState
        icon={<CalendarDays aria-hidden="true" />}
        title="No events scheduled"
        description="There are no academic calendar events to display."
        className={className}
      />
    );
  }

  return (
    <div className={clsx(styles.container, className)} aria-label={ariaLabel}>
      <div className={styles.layout}>
        {/* Calendar grid */}
        <div className={styles.calendarSection}>
          <div className={styles.header}>
            <IconButton
              variant="ghost"
              size="sm"
              className={styles.navButton}
              label="Previous month"
              onClick={handlePrevMonth}
              disabled={isDateDisabled(subMonths(viewMonth, 1))}
            >
              <ChevronLeft aria-hidden="true" />
            </IconButton>
            <span className={styles.monthLabel} aria-live="polite">
              {format(viewMonth, "MMMM yyyy")}
            </span>
            <IconButton
              variant="ghost"
              size="sm"
              className={styles.navButton}
              label="Next month"
              onClick={handleNextMonth}
              disabled={isDateDisabled(addMonths(viewMonth, 1))}
            >
              <ChevronRight aria-hidden="true" />
            </IconButton>
          </div>

          <div className={styles.weekdays}>
            {weekdayLabels.map((day) => (
              <span key={day} className={styles.weekday}>
                {day.charAt(0)}
              </span>
            ))}
          </div>

          <div className={styles.days} role="grid" aria-label={format(viewMonth, "MMMM yyyy")}>
            {days.map((date) => {
              const inMonth = isSameMonth(date, viewMonth);
              const dayKey = date.toISOString();
              const dayEvents = eventsByDay.get(dayKey) ?? [];
              const hasEvents = dayEvents.length > 0;
              const isToday = isSameDay(date, new Date());
              const isDisabled = isDateDisabled(date);

              return (
                <div
                  key={dayKey}
                  role="gridcell"
                  aria-disabled={isDisabled || undefined}
                  className={clsx(
                    styles.day,
                    !inMonth && styles.outsideMonth,
                    isDisabled && styles.dayDisabled,
                    isToday && styles.today,
                  )}
                >
                  <span className={styles.dayNumber}>{format(date, "d")}</span>
                  {hasEvents && (
                    <div className={styles.indicators}>
                      {dayEvents.slice(0, 4).map((event) => {
                        const color = event.colorToken
                          ? resolveChartColor(event.colorToken)
                          : resolveChartColor("primary");
                        return (
                          <span
                            key={event.id}
                            className={styles.indicator}
                            style={{ backgroundColor: color }}
                            title={event.title}
                          />
                        );
                      })}
                      {dayEvents.length > 4 && (
                        <span className={styles.moreIndicators}>
                          +{dayEvents.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Agenda */}
        <div className={styles.agendaSection}>
          <h4 className={styles.agendaTitle}>
            {format(viewMonth, "MMMM")} Events
          </h4>
          {monthAgenda.length === 0 ? (
            <p className={styles.agendaEmpty}>No events this month.</p>
          ) : (
            <ul className={styles.agendaList}>
              {monthAgenda.map((event) => {
                const color = event.colorToken
                  ? resolveChartColor(event.colorToken)
                  : resolveChartColor("primary");
                const isSelected = selectedEventId === event.id;
                const dateLabel = event.endDate
                  ? `${format(event.date, "MMM d")} – ${format(event.endDate, "MMM d")}`
                  : format(event.date, "EEE, MMM d");
                return (
                  <li key={event.id}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={clsx(
                        styles.agendaItem,
                        isSelected && styles.agendaItemSelected,
                      )}
                      onClick={() => handleSelectEvent(event)}
                      aria-label={`${EVENT_TYPE_LABELS[event.type]}: ${event.title}, ${dateLabel}`}
                    >
                      <span
                        className={styles.agendaDot}
                        style={{ backgroundColor: color }}
                        aria-hidden="true"
                      />
                      <span className={styles.agendaContent}>
                        <span className={styles.agendaDate}>{dateLabel}</span>
                        <span className={styles.agendaEventTitle}>
                          {event.title}
                        </span>
                        <span className={styles.agendaType}>
                          {EVENT_TYPE_LABELS[event.type]}
                        </span>
                        {event.location && (
                          <span className={styles.agendaLocation}>
                            <MapPin aria-hidden="true" className={styles.agendaIcon} />
                            {event.location}
                          </span>
                        )}
                        {event.description && (
                          <span className={styles.agendaDesc}>
                            {event.description}
                          </span>
                        )}
                      </span>
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
