"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { Bus, CheckCircle2, CircleSlash, XCircle } from "lucide-react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Alert } from "@/components/ui/Alert";
import type {
  TransportRoute,
  TransportPassenger,
  TransportAttendanceEntry,
  TransportAttendanceMark,
} from "@/components/features/transport/types";
import styles from "./TransportAttendanceRegister.module.scss";

export interface TransportAttendanceRegisterProps {
  route?: TransportRoute | null;
  passengers: TransportPassenger[];
  date: Date | string;
  /** Attendance marks keyed by passengerId. */
  marks: Record<string, TransportAttendanceEntry>;
  onMark: (entry: TransportAttendanceEntry) => void;
  loading?: boolean;
  error?: string;
  className?: string;
}

type PresentStatus = "present" | "absent" | "unmarked";

function toPresentStatus(
  mark: TransportAttendanceMark | undefined,
): PresentStatus {
  if (!mark) return "unmarked";
  const lower = mark.toLowerCase();
  if (lower === "present" || lower === "boarded" || lower === "onboard") {
    return "present";
  }
  if (lower === "absent" || lower === "missed" || lower === "no-show") {
    return "absent";
  }
  return "unmarked";
}

export function TransportAttendanceRegister({
  route,
  passengers,
  date,
  marks,
  onMark,
  loading = false,
  error,
  className,
}: TransportAttendanceRegisterProps) {
  const dateStr = useMemo(() => {
    const d = typeof date === "string" ? new Date(date) : date;
    return format(d, "EEE, MMM d, yyyy");
  }, [date]);

  if (loading) {
    return (
      <Card padded className={clsx(styles.container, className)}>
        <p className={styles.loadingText}>Loading attendance register…</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card padded className={clsx(styles.container, className)}>
        <Alert variant="error" title="Unable to load register" description={error} />
      </Card>
    );
  }

  if (passengers.length === 0) {
    return (
      <Card padded className={clsx(styles.container, className)}>
        <EmptyState
          icon={<Bus aria-hidden="true" />}
          title="No passengers"
          description="There are no passengers on this route."
        />
      </Card>
    );
  }

  return (
    <Card padded={false} className={clsx(styles.container, className)}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Bus className={styles.headerIcon} aria-hidden="true" />
          <div>
            <h3 className={styles.routeName}>
              {route?.name ?? "Route"}
            </h3>
            {route?.code && (
              <span className={styles.routeCode}>{route.code}</span>
            )}
          </div>
        </div>
        <span className={styles.dateBadge}>{dateStr}</span>
      </div>

      <div className={styles.scrollWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col" className={styles.th}>Passenger</th>
              <th scope="col" className={styles.statusTh}>Status</th>
              <th scope="col" className={styles.th}>Present</th>
              <th scope="col" className={styles.th}>Absent</th>
            </tr>
          </thead>
          <tbody>
            {passengers.map((p) => {
              const entry = marks[p.id];
              const status = toPresentStatus(entry?.mark);
              return (
                <tr key={p.id} className={styles.tr}>
                  <td className={styles.td}>
                    <div className={styles.passengerCell}>
                      <Avatar
                        name={p.name}
                        src={p.avatarSrc}
                        alt=""
                        size="sm"
                      />
                      <div className={styles.passengerInfo}>
                        <span className={styles.passengerName}>{p.name}</span>
                        {p.gradeOrRole && (
                          <span className={styles.passengerMeta}>{p.gradeOrRole}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <span
                      className={clsx(
                        styles.statusBadge,
                        status === "present" && styles.statusPresent,
                        status === "absent" && styles.statusAbsent,
                        status === "unmarked" && styles.statusUnmarked,
                      )}
                    >
                      {status === "present" && (
                        <CheckCircle2 className={styles.statusIcon} aria-hidden="true" />
                      )}
                      {status === "absent" && (
                        <XCircle className={styles.statusIcon} aria-hidden="true" />
                      )}
                      {status === "unmarked" && (
                        <CircleSlash className={styles.statusIcon} aria-hidden="true" />
                      )}
                      {status === "present" ? "Present" : status === "absent" ? "Absent" : "—"}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <Checkbox
                      aria-label={`Mark ${p.name} present`}
                      checked={status === "present"}
                      onChange={(e) => {
                        if (e.target.checked) {
                          onMark({ passengerId: p.id, mark: "present" });
                        }
                      }}
                    />
                  </td>
                  <td className={styles.td}>
                    <Checkbox
                      aria-label={`Mark ${p.name} absent`}
                      checked={status === "absent"}
                      onChange={(e) => {
                        if (e.target.checked) {
                          onMark({ passengerId: p.id, mark: "absent" });
                        }
                      }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
