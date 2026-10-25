"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Calendar } from "@/components/ui/Calendar";
import { CalendarDays, Clock, User, CalendarPlus } from "lucide-react";
import type { MeetingSlot, DisabledState } from "@/components/features/engagement/models";
import styles from "./MeetingScheduler.module.scss";

export interface MeetingSchedulerProps {
  /** Available meeting slots — all data supplied via props. */
  slots?: MeetingSlot[];
  /** Currently selected slot id (controlled). */
  selectedSlotId?: string;
  /** Callback when a slot is selected. */
  onSelectSlot?: (slotId: string) => void;
  /** Callback to schedule the selected meeting. */
  onSchedule?: (slotId: string) => void;
  /** Optional header title. */
  title?: string;
  /** Loading state — shows a spinner. */
  loading?: boolean;
  /** Error message — shows an error alert. */
  error?: string;
  /** Empty state — shows placeholder. */
  empty?: boolean;
  /** Disabled state — dims and blocks interaction. */
  disabled?: DisabledState;
  /** Optional slot for extra content below the scheduler. */
  children?: ReactNode;
  className?: string;
}

function toDate(value: Date | string): Date {
  return typeof value === "string" ? new Date(value) : value;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function MeetingScheduler({
  slots = [],
  selectedSlotId,
  onSelectSlot,
  onSchedule,
  title = "Schedule a meeting",
  loading = false,
  error,
  empty = false,
  disabled,
  children,
  className,
}: MeetingSchedulerProps) {
  const [monthDate, setMonthDate] = useState<Date>(() => {
    if (slots.length > 0) return toDate(slots[0].date);
    return new Date();
  });

  const isDisabled = Boolean(disabled?.disabled);

  const groupedByDay = useMemo(() => {
    const map = new Map<string, MeetingSlot[]>();
    for (const slot of slots) {
      const d = toDate(slot.date);
      const key = d.toDateString();
      const list = map.get(key);
      if (list) list.push(slot);
      else map.set(key, [slot]);
    }
    return map;
  }, [slots]);

  const availableDays = useMemo(
    () =>
      Array.from(groupedByDay.keys()).map((key) => new Date(key)),
    [groupedByDay],
  );

  const disabledDates = useMemo(() => {
    const availableSet = new Set(availableDays.map((d) => d.toDateString()));
    const result: Date[] = [];
    const start = new Date(monthDate);
    start.setDate(1);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    while (start < end) {
      if (!availableSet.has(start.toDateString())) {
        result.push(new Date(start));
      }
      start.setDate(start.getDate() + 1);
    }
    return result;
  }, [availableDays, monthDate]);

  const selectedSlot = useMemo(
    () => slots.find((s) => s.id === selectedSlotId) ?? null,
    [slots, selectedSlotId],
  );

  const selectedDaySlots = useMemo(() => {
    if (!selectedSlot) return [];
    const key = toDate(selectedSlot.date).toDateString();
    return groupedByDay.get(key) ?? [];
  }, [selectedSlot, groupedByDay]);

  if (loading) {
    return (
      <Card padded className={clsx(styles.loading, className)}>
        <Spinner size="md" label="Loading meeting slots" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card padded className={className}>
        <Alert variant="error" title="Scheduler unavailable" description={error} />
      </Card>
    );
  }

  if (empty || slots.length === 0) {
    return (
      <Card padded className={clsx(styles.empty, className)}>
        <EmptyState
          icon={<CalendarDays aria-hidden="true" />}
          title="No slots available"
          description="There are no meeting slots to schedule right now."
        />
      </Card>
    );
  }

  return (
    <Card
      padded={false}
      className={clsx(
        styles.scheduler,
        isDisabled && styles.disabled,
        className,
      )}
      aria-disabled={isDisabled || undefined}
    >
      <div className={styles.body}>
        <div className={styles.header}>
          <span className={styles.headerIcon}>
            <CalendarDays aria-hidden="true" />
          </span>
          <h3 className={styles.title}>{title}</h3>
        </div>

        <div className={styles.calendar}>
          <Calendar
            mode="single"
            selected={selectedSlot ? toDate(selectedSlot.date) : null}
            onSelect={(d) => {
              const key = d.toDateString();
              const daySlots = groupedByDay.get(key);
              if (daySlots && daySlots.length > 0) {
                onSelectSlot?.(daySlots[0].id);
              }
            }}
            defaultMonth={monthDate}
            onMonthChange={setMonthDate}
            disabledDates={disabledDates}
            disabled={isDisabled}
          />
        </div>

        {selectedDaySlots.length > 0 && (
          <div className={styles.slots}>
            <p className={styles.slotsLabel}>
              {isSameDay(toDate(selectedSlot?.date ?? new Date()), new Date())
                ? "Today's slots"
                : "Slots for selected day"}
            </p>
            <div className={styles.slotList}>
              {selectedDaySlots.map((slot) => {
                const isSelected = slot.id === selectedSlotId;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    className={clsx(
                      styles.slot,
                      isSelected && styles.slotSelected,
                      !slot.available && styles.slotUnavailable,
                    )}
                    onClick={() => slot.available && onSelectSlot?.(slot.id)}
                    disabled={!slot.available || isDisabled}
                    aria-pressed={isSelected}
                  >
                    <span className={styles.slotTime}>
                      <Clock aria-hidden="true" />
                      <span>
                        {slot.startTime} — {slot.endTime}
                      </span>
                    </span>
                    {slot.available ? (
                      <Badge variant={isSelected ? "primary" : "neutral"} size="sm">
                        {isSelected ? "Selected" : "Open"}
                      </Badge>
                    ) : slot.bookedByName ? (
                      <span className={styles.bookedBy}>
                        <User aria-hidden="true" />
                        <span>{slot.bookedByName}</span>
                      </span>
                    ) : (
                      <Badge variant="neutral" size="sm">Booked</Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {isDisabled && disabled?.disabledReason && (
          <p className={styles.disabledReason}>{disabled.disabledReason}</p>
        )}

        {children && <div className={styles.extra}>{children}</div>}
      </div>

      {onSchedule && (
        <div className={styles.footer}>
          <Button
            variant="primary"
            size="md"
            loading={loading}
            disabled={isDisabled || !selectedSlotId}
            onClick={() => selectedSlotId && onSchedule(selectedSlotId)}
            leftIcon={<CalendarPlus aria-hidden="true" />}
          >
            Schedule meeting
          </Button>
        </div>
      )}
    </Card>
  );
}