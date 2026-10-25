"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import {
  ChevronDown,
  ChevronUp,
  OctagonAlert as AlertOctagon,
  TriangleAlert as AlertTriangle,
  CircleAlert as AlertCircle,
  Info,
} from "lucide-react";
import clsx from "clsx";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import styles from "./AlertSummary.module.scss";

export type AlertSeverity = "critical" | "warning" | "info" | "resolved";

export interface AlertSeverityCount {
  severity: AlertSeverity;
  count: number;
  label?: string;
}

export interface AlertSummaryDetailItem {
  id: string;
  title: string;
  severity: AlertSeverity;
  description?: string;
}

export interface AlertSummaryProps {
  counts: AlertSeverityCount[];
  details?: AlertSummaryDetailItem[];
  loading?: boolean;
  error?: string;
  /** Render nothing when all counts are zero and no error. */
  hideWhenEmpty?: boolean;
  summary?: string;
  className?: string;
  children?: ReactNode;
}

const SEVERITY_CONFIG: Record<
  AlertSeverity,
  { variant: "error" | "warning" | "info" | "success"; icon: ReactNode; defaultLabel: string }
> = {
  critical: {
    variant: "error",
    icon: <AlertOctagon aria-hidden="true" size={14} />,
    defaultLabel: "Critical",
  },
  warning: {
    variant: "warning",
    icon: <AlertTriangle aria-hidden="true" size={14} />,
    defaultLabel: "Warning",
  },
  info: {
    variant: "info",
    icon: <AlertCircle aria-hidden="true" size={14} />,
    defaultLabel: "Info",
  },
  resolved: {
    variant: "success",
    icon: <Info aria-hidden="true" size={14} />,
    defaultLabel: "Resolved",
  },
};

export function AlertSummary({
  counts,
  details,
  loading = false,
  error,
  hideWhenEmpty = false,
  summary,
  className,
  children,
}: AlertSummaryProps) {
  const [expanded, setExpanded] = useState(false);

  const total = counts.reduce((sum, c) => sum + c.count, 0);
  const hasDetails = Boolean(details && details.length > 0);

  if (!loading && !error && total === 0 && hideWhenEmpty) {
    return null;
  }

  const toggle = () => setExpanded((v) => !v);

  return (
    <div
      className={clsx(styles.container, className)}
      aria-label={summary ?? "Alert summary"}
    >
      {loading ? (
        <div className={styles.loadingRow}>
          <Spinner size="sm" label="Loading alert summary" />
        </div>
      ) : error ? (
        <Alert variant="error" title="Alerts unavailable" description={error} />
      ) : (
        <>
          <div className={styles.countRow}>
            {counts.map((c) => {
              const cfg = SEVERITY_CONFIG[c.severity];
              return (
                <span key={c.severity} className={styles.countItem}>
                  <Badge variant={cfg.variant} size="sm" icon={cfg.icon}>
                    {cfg.defaultLabel}
                  </Badge>
                  <span className={styles.countValue} aria-label={`${cfg.defaultLabel}: ${c.count}`}>
                    {c.count}
                  </span>
                </span>
              );
            })}
            {hasDetails && (
              <button
                type="button"
                className={styles.toggleButton}
                onClick={toggle}
                aria-expanded={expanded}
                aria-controls="alert-summary-details"
              >
                {expanded ? (
                  <ChevronUp aria-hidden="true" size={16} />
                ) : (
                  <ChevronDown aria-hidden="true" size={16} />
                )}
                <span>{expanded ? "Hide details" : "Show details"}</span>
              </button>
            )}
          </div>
          {children}
          {hasDetails && expanded && (
            <ul className={styles.detailList} id="alert-summary-details">
              {details!.map((d) => {
                const cfg = SEVERITY_CONFIG[d.severity];
                return (
                  <li key={d.id} className={styles.detailItem}>
                    <Badge variant={cfg.variant} size="sm" icon={cfg.icon}>
                      {cfg.defaultLabel}
                    </Badge>
                    <div className={styles.detailContent}>
                      <span className={styles.detailTitle}>{d.title}</span>
                      {d.description && (
                        <span className={styles.detailDescription}>{d.description}</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
