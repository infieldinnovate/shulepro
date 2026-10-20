"use client";

import type { ReactNode } from "react";
import { Info } from "lucide-react";
import clsx from "clsx";
import { Card } from "../../../ui/Card";
import { Spinner } from "../../../ui/Spinner";
import { Alert } from "../../../ui/Alert";
import { EmptyState } from "../../../ui/EmptyState";
import { ProgressTrend } from "../../../shared/ProgressTrend";
import type { TrendSeries } from "../../../shared/ProgressTrend";
import { TrendIndicator } from "../../../shared/TrendIndicator";
import type { TrendDirection } from "@/lib/analytics";
import type { WellbeingTrendSeries } from "../types";
import styles from "./WellbeingTrendPanel.module.scss";

export interface WellbeingTrendPanelProps {
  title?: string;
  description?: string;
  series: WellbeingTrendSeries[];
  /** Pre-computed latest trend direction (caller-supplied). */
  trendDirection?: TrendDirection | null;
  /** Accessible summary of the latest trend (caller-supplied, neutral). */
  summary?: string;
  yAxisLabel?: string;
  unit?: string;
  height?: string;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  /** Optional content rendered below the chart (e.g. legend notes). */
  children?: ReactNode;
  className?: string;
}

function toProgressTrendSeries(
  series: WellbeingTrendSeries[],
): TrendSeries[] {
  return series.map((s) => ({
    key: s.key,
    name: s.name,
    data: s.data.map((pt) => ({
      label: pt.label,
      value: pt.value,
    })),
    color: s.color ?? "var(--color-primary-500)",
    area: s.area,
    reference: s.reference,
  }));
}

export function WellbeingTrendPanel({
  title = "Wellbeing trend",
  description,
  series,
  trendDirection = null,
  summary,
  yAxisLabel,
  unit,
  height,
  loading = false,
  error,
  empty = false,
  children,
  className,
}: WellbeingTrendPanelProps) {
  if (loading) {
    return (
      <Card className={clsx(styles.card, styles.loadingCard, className)} padded>
        <div className={styles.loadingBody}>
          <Spinner size="md" label="Loading wellbeing trend" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <Alert
          variant="error"
          title="Unable to load wellbeing trend"
          description={error}
        />
      </Card>
    );
  }

  const isEmpty = empty || series.length === 0;

  if (isEmpty) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <EmptyState
          icon={<Info aria-hidden="true" />}
          title="No trend data"
          description="Wellbeing trend data will appear here once check-ins are recorded."
        />
      </Card>
    );
  }

  const trendSeries = toProgressTrendSeries(series);

  return (
    <div className={clsx(styles.container, className)}>
      {trendDirection != null && (
        <Card className={styles.summaryCard} padded>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Latest direction:</span>
            <TrendIndicator
              direction={trendDirection}
              comparisonLabel={title}
            />
          </div>
          {summary && (
            <p className={styles.summaryText}>{summary}</p>
          )}
        </Card>
      )}
      <ProgressTrend
        title={title}
        description={description}
        series={trendSeries}
        yAxisLabel={yAxisLabel}
        unit={unit}
        height={height}
        summary={summary}
      />
      {children}
    </div>
  );
}
