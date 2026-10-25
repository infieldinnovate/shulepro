import type { ReactNode } from "react";
import { Info, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Alert } from "@/components/ui/Alert";
import {
  computeTrend,
  classifyDataPoint,
  computeTargetProgress,
  formatDelta,
  formatPercentChange,
  type DataPresence,
  type TargetStatus,
  type TargetResult,
} from "@/lib/analytics";
import styles from "./BreakdownTable.module.scss";

export interface BreakdownStatusConfig {
  status: TargetStatus;
  label?: string;
}

export interface BreakdownRow {
  key: string;
  category: string;
  sublabel?: string;
  value: number | null | undefined;
  reference?: number | null | undefined;
  target?: number | null | undefined;
  unit?: string;
  formatValue?: (n: number) => string;
  invertPolarity?: boolean;
  onDrillDown?: () => void;
}

export interface BreakdownTableProps {
  title: string;
  categoryLabel?: string;
  measureLabel?: string;
  deltaLabel?: string;
  statusLabel?: string;
  rows: BreakdownRow[];
  loading?: boolean;
  error?: string;
  empty?: boolean;
  targetThresholds?: { onTrack?: number; atRisk?: number };
  summary?: string;
  className?: string;
  children?: ReactNode;
}

function defaultFormat(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

const STATUS_BADGE: Record<
  TargetStatus,
  { variant: "neutral" | "success" | "warning" | "error" | "info"; label: string }
> = {
  "on-track": { variant: "success", label: "On track" },
  "at-risk": { variant: "warning", label: "At risk" },
  behind: { variant: "error", label: "Behind" },
  exceeded: { variant: "info", label: "Exceeded" },
  "no-target": { variant: "neutral", label: "No target" },
};

function presenceBadge(p: DataPresence, unit?: string): ReactNode {
  if (p === "present") return null;
  const variant = p === "missing" ? "warning" : "info";
  const label = p === "missing" ? "No data" : unit ? `0 ${unit}` : "Zero";
  return (
    <Badge variant={variant} size="sm">
      {label}
    </Badge>
  );
}

export function BreakdownTable({
  title,
  categoryLabel = "Category",
  measureLabel = "Measure",
  deltaLabel = "Change",
  statusLabel = "Status",
  rows,
  loading = false,
  error,
  empty = false,
  targetThresholds,
  summary,
  className,
  children,
}: BreakdownTableProps) {
  const hasAnyReference = rows.some((r) => r.reference != null);
  const hasAnyTarget = rows.some((r) => r.target != null);
  const hasAnyDrillDown = rows.some((r) => r.onDrillDown);

  const body = (() => {
    if (loading) {
      return (
        <div className={styles.loadingBody}>
          <Spinner size="md" label={`Loading ${title}`} />
        </div>
      );
    }
    if (error) {
      return <Alert variant="error" title="Data unavailable" description={error} />;
    }
    if (empty || rows.length === 0) {
      return (
        <EmptyState
          icon={<Info aria-hidden="true" />}
          title="No breakdown data"
          description={`There is no breakdown data available for ${title.toLowerCase()} yet.`}
        />
      );
    }

    return (
      <Table zebra caption={summary ?? title} className={styles.table}>
        <Table.Header>
          <Table.Row>
            <Table.Head>{categoryLabel}</Table.Head>
            <Table.Head align="end" numeric>
              {measureLabel}
            </Table.Head>
            {hasAnyReference && (
              <Table.Head align="end" numeric>
                {deltaLabel}
              </Table.Head>
            )}
            {hasAnyTarget && (
              <Table.Head align="center">{statusLabel}</Table.Head>
            )}
            {hasAnyDrillDown && (
              <Table.Head align="end">
                <span className={styles.srOnly}>Actions</span>
              </Table.Head>
            )}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((row) => {
            const fmt = row.formatValue ?? defaultFormat;
            const unit = row.unit ?? "";
            const presence = classifyDataPoint(row.value);
            const trend = computeTrend(row.value, row.reference);
            const hasReference = trend.direction != null;
            const targetResult: TargetResult = computeTargetProgress(
              row.value,
              row.target,
              targetThresholds,
            );
            const interactive = Boolean(row.onDrillDown);

            return (
              <Table.Row
                key={row.key}
                className={clsx(interactive && styles.interactiveRow)}
              >
                <Table.Cell>
                  <span className={styles.categoryLabel}>{row.category}</span>
                  {row.sublabel && (
                    <span className={styles.sublabel}>{row.sublabel}</span>
                  )}
                </Table.Cell>
                <Table.Cell align="end" numeric>
                  {presence === "present" ? (
                    <span className={styles.value}>
                      {fmt(row.value!)}
                      {unit && <span className={styles.unit}> {unit}</span>}
                    </span>
                  ) : (
                    presenceBadge(presence, row.unit)
                  )}
                </Table.Cell>
                {hasAnyReference && (
                  <Table.Cell align="end" numeric>
                    {hasReference ? (
                      <span
                        className={styles.deltaValue}
                        title={`${formatDelta(trend.delta)} (${formatPercentChange(trend.percentChange) ?? "no %"})`}
                      >
                        {formatDelta(trend.delta)}
                        {trend.percentChange != null && (
                          <span className={styles.deltaPercent}>
                            {" "}
                            {formatPercentChange(trend.percentChange)}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span
                        className={styles.noReference}
                        title="No comparable reference"
                      >
                        —
                      </span>
                    )}
                  </Table.Cell>
                )}
                {hasAnyTarget && (
                  <Table.Cell align="center">
                    <Badge
                      variant={STATUS_BADGE[targetResult.status].variant}
                      size="sm"
                      dot
                    >
                      {STATUS_BADGE[targetResult.status].label}
                    </Badge>
                  </Table.Cell>
                )}
                {hasAnyDrillDown && (
                  <Table.Cell align="end">
                    {interactive ? (
                      <button
                        type="button"
                        className={styles.drillDownBtn}
                        aria-label={`View details for ${row.category}`}
                        onClick={row.onDrillDown}
                      >
                        <ChevronRight aria-hidden="true" size={16} />
                      </button>
                    ) : (
                      <span
                        className={styles.drillDownPlaceholder}
                        aria-hidden="true"
                      />
                    )}
                  </Table.Cell>
                )}
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    );
  })();

  return (
    <section className={clsx(styles.section, className)} aria-label={title}>
      <h4 className={styles.srOnly}>{title}</h4>
      {body}
      {children}
    </section>
  );
}
