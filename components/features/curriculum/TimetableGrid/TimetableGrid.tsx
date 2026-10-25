"use client";

import { useCallback, useMemo, useState } from "react";
import { CalendarDays, MapPin, User } from "lucide-react";
import clsx from "clsx";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { resolveChartColor } from "@/lib/chartColors";
import type {
  TimetableConfig,
  TimetableEntry,
} from "@/components/features/curriculum/types";
import styles from "./TimetableGrid.module.scss";

export interface TimetableGridProps {
  config: TimetableConfig;
  entries: TimetableEntry[];
  onCellClick?: (entry: TimetableEntry) => void;
  onCellDrillDown?: (entry: TimetableEntry) => void;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  ariaLabel?: string;
  className?: string;
}

export function TimetableGrid({
  config,
  entries,
  onCellClick,
  onCellDrillDown,
  loading = false,
  error,
  empty = false,
  ariaLabel = "Weekly timetable",
  className,
}: TimetableGridProps) {
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  const sortedWeekdays = useMemo(
    () => [...config.weekdays].sort((a, b) => a.order - b.order),
    [config.weekdays],
  );

  const sortedPeriods = useMemo(() => config.periods, [config.periods]);

  const entryMap = useMemo(() => {
    const map = new Map<string, TimetableEntry>();
    for (const entry of entries) {
      map.set(`${entry.dayKey}::${entry.periodKey}`, entry);
    }
    return map;
  }, [entries]);

  const activeDayKey = selectedDayKey ?? sortedWeekdays[0]?.key ?? null;

  const handleCellClick = useCallback(
    (entry: TimetableEntry) => {
      onCellClick?.(entry);
      onCellDrillDown?.(entry);
    },
    [onCellClick, onCellDrillDown],
  );

  const renderEntry = (entry: TimetableEntry) => {
    const color = entry.colorToken
      ? resolveChartColor(entry.colorToken)
      : resolveChartColor("primary100");
    const interactive = Boolean(onCellClick || onCellDrillDown);
    return (
      <Button
        variant="ghost"
        size="sm"
        className={clsx(styles.cellBtn, interactive && styles.cellInteractive)}
        style={{ "--entry-color": color } as React.CSSProperties}
        aria-label={`${entry.learningArea}${entry.teacher ? `, ${entry.teacher}` : ""}${entry.location ? `, ${entry.location}` : ""}`}
        onClick={() => handleCellClick(entry)}
        disabled={!interactive}
      >
        <span className={styles.entryArea}>{entry.learningArea}</span>
        {entry.teacher && (
          <span className={styles.entryMeta}>
            <User aria-hidden="true" className={styles.entryIcon} />
            {entry.teacher}
          </span>
        )}
        {entry.location && (
          <span className={styles.entryMeta}>
            <MapPin aria-hidden="true" className={styles.entryIcon} />
            {entry.location}
          </span>
        )}
      </Button>
    );
  };

  const renderFreeCell = () => (
    <span className={styles.freeCell}>{config.freeLabel ?? "Free"}</span>
  );

  if (loading) {
    return (
      <div className={clsx(styles.loading, className)}>
        <Spinner size="md" label="Loading timetable" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        variant="error"
        title="Unable to load timetable"
        description={error}
        className={className}
      />
    );
  }

  if (empty || entries.length === 0) {
    return (
      <EmptyState
        icon={<CalendarDays aria-hidden="true" />}
        title="No timetable entries"
        description="There are no scheduled periods to display."
        className={className}
      />
    );
  }

  return (
    <div className={clsx(styles.container, className)} aria-label={ariaLabel}>
      {/* Mobile day tabs + stacked view */}
      <Tabs
        className={styles.mobileTabs}
        ariaLabel="Select day"
        selectedIndex={Math.max(
          0,
          sortedWeekdays.findIndex((d) => d.key === activeDayKey),
        )}
        onSelect={(index) =>
          setSelectedDayKey(sortedWeekdays[index]?.key ?? null)
        }
        items={sortedWeekdays.map((day) => ({
          id: day.key,
          label: day.shortLabel ?? day.label,
          content: (
            <div className={styles.stackedView}>
              {sortedPeriods.map((period) => {
                const entry = entryMap.get(`${day.key}::${period.key}`);
                return (
                  <div key={period.key} className={styles.stackedRow}>
                    <div className={styles.stackedTime}>
                      <span className={styles.stackedPeriod}>{period.label}</span>
                      {period.startTime && period.endTime && (
                        <span className={styles.stackedTimeRange}>
                          {period.startTime}–{period.endTime}
                        </span>
                      )}
                    </div>
                    <div
                      className={clsx(
                        styles.stackedCell,
                        period.isBreak && styles.breakCell,
                      )}
                    >
                      {period.isBreak ? (
                        <span className={styles.breakLabel}>{period.label}</span>
                      ) : entry ? (
                        renderEntry(entry)
                      ) : (
                        renderFreeCell()
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ),
        }))}
      />

      {/* Grid view (desktop) */}
      <div
        className={styles.gridScroll}
        role="grid"
        aria-label={ariaLabel}
        tabIndex={0}
      >
        <table className={styles.gridTable}>
          <thead>
            <tr>
              <th scope="col" className={styles.timeCol}>
                {config.timeColumnLabel ?? "Time"}
              </th>
              {sortedWeekdays.map((day) => (
                <th key={day.key} scope="col" className={styles.dayCol}>
                  {day.shortLabel ?? day.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedPeriods.map((period) => (
              <tr key={period.key} className={period.isBreak ? styles.breakRow : undefined}>
                <th scope="row" className={styles.timeCol}>
                  <span className={styles.periodLabel}>{period.label}</span>
                  {period.startTime && period.endTime && (
                    <span className={styles.timeRange}>
                      {period.startTime}–{period.endTime}
                    </span>
                  )}
                </th>
                {period.isBreak ? (
                  <td
                    colSpan={sortedWeekdays.length}
                    className={styles.breakCellWide}
                  >
                    <span className={styles.breakLabel}>{period.label}</span>
                  </td>
                ) : (
                  sortedWeekdays.map((day) => {
                    const entry = entryMap.get(`${day.key}::${period.key}`);
                    return (
                      <td key={day.key} className={styles.gridCell}>
                        {entry ? renderEntry(entry) : renderFreeCell()}
                      </td>
                    );
                  })
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
