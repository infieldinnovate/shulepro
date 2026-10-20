import type { ReactNode } from "react";
import { CircleAlert as AlertCircle, Info } from "lucide-react";
import clsx from "clsx";
import { Card } from "../../ui/Card";
import { Badge } from "../../ui/Badge";
import { Spinner } from "../../ui/Spinner";
import { EmptyState } from "../../ui/EmptyState";
import { Alert } from "../../ui/Alert";
import { TrendIndicator } from "../TrendIndicator";
import type { TrendDirection } from "@/lib/analytics";
import styles from "./KpiCard.module.scss";

export type KpiCardStatus = "good" | "warning" | "critical" | "neutral";

export interface KpiCardTrend {
  direction: TrendDirection | null;
  percentLabel?: string | null;
  deltaLabel?: string | null;
  /** Invert polarity so "up" reads as negative (e.g. absence rate). */
  invertPolarity?: boolean;
}

export interface KpiCardProps {
  title: string;
  /** Primary numeric or string value. Omit / pass null when data is unavailable. */
  value?: string | number | null;
  /** Optional unit suffix (e.g. "%", "learners"). */
  unit?: string;
  trend?: KpiCardTrend;
  /** Optional target value for inline display. */
  target?: { label: string; value: string | number };
  status?: KpiCardStatus;
  /** When true, render a loading skeleton. */
  loading?: boolean;
  /** Error message to display instead of the value. */
  error?: string;
  /** When true (and no error/loading), render an empty-data state. */
  empty?: boolean;
  /** Optional accessible description of what the value represents. */
  description?: string;
  /** Optional icon shown next to the title. */
  icon?: ReactNode;
  /** Optional definition tooltip node (typically a MetricDefinitionTooltip). */
  definition?: ReactNode;
  /** Drill-down handler — no route assumption; caller decides navigation. */
  onSelect?: () => void;
  className?: string;
  children?: ReactNode;
}

const STATUS_BADGE: Record<
  Exclude<KpiCardStatus, "neutral">,
  { variant: "success" | "warning" | "error"; label: string }
> = {
  good: { variant: "success", label: "On track" },
  warning: { variant: "warning", label: "At risk" },
  critical: { variant: "error", label: "Critical" },
};

export function KpiCard({
  title,
  value,
  unit,
  trend,
  target,
  status = "neutral",
  loading = false,
  error,
  empty = false,
  description,
  icon,
  definition,
  onSelect,
  className,
  children,
}: KpiCardProps) {
  const interactive = Boolean(onSelect) && !loading && !error;

  const body = (() => {
    if (loading) {
      return (
        <div className={styles.loadingBody}>
          <Spinner size="md" label={`Loading ${title}`} />
        </div>
      );
    }

    if (error) {
      return (
        <Alert
          variant="error"
          title="Data unavailable"
          description={error}
          icon={<AlertCircle aria-hidden="true" />}
        />
      );
    }

    if (empty || value == null) {
      return (
        <EmptyState
          icon={<Info aria-hidden="true" />}
          title="No data yet"
          description={`There is no data available for ${title.toLowerCase()} yet.`}
        />
      );
    }

    return (
      <div className={styles.valueRow}>
        <span className={styles.value} title={description}>
          {value}
        </span>
        {unit && <span className={styles.unit}>{unit}</span>}
        {trend && (
          <TrendIndicator
            direction={trend.direction}
            percentLabel={trend.percentLabel}
            deltaLabel={trend.deltaLabel}
            invertPolarity={trend.invertPolarity}
            comparisonLabel={title}
            className={styles.trend}
          />
        )}
      </div>
    );
  })();

  const statusBadge =
    status !== "neutral" && !loading && !error ? (
      <Badge variant={STATUS_BADGE[status].variant} size="sm" dot>
        {STATUS_BADGE[status].label}
      </Badge>
    ) : null;

  return (
    <Card
      className={clsx(styles.card, interactive && styles.interactive, className)}
      padded
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? onSelect : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect?.();
              }
            }
          : undefined
      }
      aria-label={interactive ? `View details for ${title}` : undefined}
    >
      <Card.Header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.titleRow}>
            {icon && <span className={styles.titleIcon}>{icon}</span>}
            <h4 className={styles.title}>{title}</h4>
            {definition && (
              <span className={styles.definition}>{definition}</span>
            )}
          </div>
          {statusBadge && (
            <span className={styles.statusBadge}>{statusBadge}</span>
          )}
        </div>
      </Card.Header>
      <Card.Body className={styles.body}>
        {body}
        {target && !loading && !error && !empty && value != null && (
          <p className={styles.target}>
            <span className={styles.targetLabel}>{target.label}:</span>{" "}
            <span className={styles.targetValue}>{target.value}</span>
          </p>
        )}
        {children}
      </Card.Body>
    </Card>
  );
}
