"use client";

import { useMemo } from "react";
import { Users } from "lucide-react";
import clsx from "clsx";
import { Card } from "../../../ui/Card";
import { Select } from "../../../ui/Select";
import type { SelectOption } from "../../../ui/Select";
import { Avatar } from "../../../ui/Avatar";
import { EmptyState } from "../../../ui/EmptyState";
import { Alert } from "../../../ui/Alert";
import type {
  TransportRoute,
  TransportPassenger,
  TransportAllocation,
} from "../types";
import styles from "./TransportAllocationPanel.module.scss";

export interface TransportAllocationPanelProps {
  routes: TransportRoute[];
  passengers: TransportPassenger[];
  allocations: TransportAllocation[];
  onAllocate: (allocation: TransportAllocation) => void;
  loading?: boolean;
  error?: string;
  className?: string;
}

export function TransportAllocationPanel({
  routes,
  passengers,
  allocations,
  onAllocate,
  loading = false,
  error,
  className,
}: TransportAllocationPanelProps) {
  const routeOptions: SelectOption[] = useMemo(
    () => [
      { value: "", label: "No route", disabled: true },
      ...routes.map((r) => ({ value: r.id, label: `${r.code} — ${r.name}` })),
    ],
    [routes],
  );

  const allocationMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of allocations) {
      map.set(a.passengerId, a.routeId);
    }
    return map;
  }, [allocations]);

  const routeLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of routes) {
      map.set(r.id, `${r.code} — ${r.name}`);
    }
    return map;
  }, [routes]);

  if (loading) {
    return (
      <Card padded className={clsx(styles.container, className)}>
        <p className={styles.loadingText}>Loading allocations…</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card padded className={clsx(styles.container, className)}>
        <Alert variant="error" title="Unable to load allocations" description={error} />
      </Card>
    );
  }

  if (passengers.length === 0) {
    return (
      <Card padded className={clsx(styles.container, className)}>
        <EmptyState
          icon={<Users aria-hidden="true" />}
          title="No passengers"
          description="There are no passengers available for allocation."
        />
      </Card>
    );
  }

  return (
    <Card padded={false} className={clsx(styles.container, className)}>
      <div className={styles.scrollWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col" className={styles.th}>Passenger</th>
              <th scope="col" className={styles.th}>Current route</th>
              <th scope="col" className={styles.th}>Assign route</th>
            </tr>
          </thead>
          <tbody>
            {passengers.map((p) => {
              const currentRouteId = allocationMap.get(p.id) ?? "";
              const currentRouteLabel = currentRouteId
                ? routeLabelMap.get(currentRouteId) ?? "Unassigned"
                : "Unassigned";
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
                    <span className={styles.currentRoute}>{currentRouteLabel}</span>
                  </td>
                  <td className={styles.td}>
                    <Select
                      options={routeOptions}
                      value={currentRouteId}
                      onChange={(e) => {
                        onAllocate({ passengerId: p.id, routeId: e.target.value });
                      }}
                      aria-label={`Assign route for ${p.name}`}
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
