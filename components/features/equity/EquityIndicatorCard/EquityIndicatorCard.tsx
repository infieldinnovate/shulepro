import type { ReactNode } from "react";
import { Scale } from "lucide-react";
import clsx from "clsx";
import { KpiCard } from "@/components/shared/KpiCard";
import type { KpiCardStatus } from "@/components/shared/KpiCard";
import { BenchmarkCard } from "@/components/shared/BenchmarkCard";
import { DataAvailabilityNotice } from "@/components/shared/DataAvailabilityNotice";
import type { DataAvailabilityStatus } from "@/components/shared/DataAvailabilityNotice";
import { computeBenchmarkDelta } from "@/lib/analytics";
import type { EquityIndicator } from "@/components/features/equity/types";
import styles from "./EquityIndicatorCard.module.scss";

export interface EquityIndicatorCardProps {
  /** Configurable equity indicator to display. */
  indicator: EquityIndicator | null;
  /** Optional title override (defaults to indicator.label). */
  title?: string;
  /** Show a definition tooltip or additional context. */
  definition?: ReactNode;
  loading?: boolean;
  error?: string;
  /** Optional content rendered below the indicator. */
  children?: ReactNode;
  className?: string;
}

function deriveStatus(
  value: number | null,
  benchmark: number | null | undefined,
  higherIsBetter: boolean,
): KpiCardStatus {
  if (value == null || benchmark == null || benchmark == undefined) {
    return "neutral";
  }
  const ratio = benchmark === 0 ? 1 : value / benchmark;
  if (higherIsBetter) {
    if (ratio >= 1) return "good";
    if (ratio >= 0.9) return "warning";
    return "critical";
  }
  if (ratio <= 1) return "good";
  if (ratio <= 1.1) return "warning";
  return "critical";
}

function computeRatio(numerator: number | null, denominator: number | null): number | null {
  if (numerator == null || denominator == null || denominator === 0) {
    return null;
  }
  return numerator / denominator;
}

function formatPercent(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

function dataStatus(
  numerator: number | null,
  denominator: number | null,
): DataAvailabilityStatus {
  if (numerator == null || denominator == null) return "missing";
  if (denominator === 0) return "missing";
  return "complete";
}

export function EquityIndicatorCard({
  indicator,
  title,
  definition,
  loading = false,
  error,
  children,
  className,
}: EquityIndicatorCardProps) {
  if (loading) {
    return (
      <div className={clsx(styles.container, className)}>
        <KpiCard title={title ?? "Equity indicator"} loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className={clsx(styles.container, className)}>
        <KpiCard title={title ?? "Equity indicator"} error={error} />
      </div>
    );
  }

  if (!indicator) {
    return (
      <div className={clsx(styles.container, className)}>
        <KpiCard title={title ?? "Equity indicator"} empty />
      </div>
    );
  }

  const ratio = computeRatio(indicator.numerator, indicator.denominator);
  const displayValue = ratio != null ? formatPercent(ratio) : null;
  const hasBenchmark = indicator.benchmark != null && indicator.benchmark !== undefined;
  const higherIsBetter = indicator.higherIsBetter ?? true;
  const status = deriveStatus(ratio, indicator.benchmark ?? null, higherIsBetter);
  const availability = dataStatus(indicator.numerator, indicator.denominator);

  const cardTitle = title ?? indicator.label;

  const showBenchmark = hasBenchmark && ratio != null;
  const benchmarkResult = computeBenchmarkDelta(ratio, indicator.benchmark ?? null);

  return (
    <div className={clsx(styles.container, className)}>
      {showBenchmark ? (
        <BenchmarkCard
          label={cardTitle}
          value={ratio}
          benchmark={indicator.benchmark}
          result={benchmarkResult}
          unit={indicator.unit}
          formatValue={formatPercent}
          invertPolarity={!higherIsBetter}
          description={indicator.description}
          definition={definition}
        >
          <div className={styles.numeratorDenominator}>
            <span className={styles.metricPair}>
              <span className={styles.metricLabel}>Numerator:</span>
              <span className={styles.metricValue}>
                {indicator.numerator != null
                  ? indicator.numerator.toLocaleString()
                  : "—"}
              </span>
            </span>
            <span className={styles.metricPair}>
              <span className={styles.metricLabel}>Denominator:</span>
              <span className={styles.metricValue}>
                {indicator.denominator != null
                  ? indicator.denominator.toLocaleString()
                  : "—"}
              </span>
            </span>
          </div>
          {indicator.comparisonNote && (
            <p className={styles.comparisonNote}>
              {indicator.comparisonNote}
            </p>
          )}
          {availability !== "complete" && (
            <DataAvailabilityNotice
              status={availability}
              message={
                availability === "missing"
                  ? "Numerator or denominator is missing — this indicator cannot be computed."
                  : "Some data is incomplete."
              }
              compact
            />
          )}
          {children}
        </BenchmarkCard>
      ) : (
        <KpiCard
          title={cardTitle}
          value={displayValue}
          status={status}
          description={indicator.description}
          definition={definition}
          icon={<Scale aria-hidden="true" />}
          target={
            indicator.target != null && indicator.targetLabel
              ? { label: indicator.targetLabel, value: formatPercent(indicator.target) }
              : undefined
          }
        >
          <div className={styles.numeratorDenominator}>
            <span className={styles.metricPair}>
              <span className={styles.metricLabel}>Numerator:</span>
              <span className={styles.metricValue}>
                {indicator.numerator != null
                  ? indicator.numerator.toLocaleString()
                  : "—"}
              </span>
            </span>
            <span className={styles.metricPair}>
              <span className={styles.metricLabel}>Denominator:</span>
              <span className={styles.metricValue}>
                {indicator.denominator != null
                  ? indicator.denominator.toLocaleString()
                  : "—"}
              </span>
            </span>
          </div>
          {indicator.comparisonNote && (
            <p className={styles.comparisonNote}>
              {indicator.comparisonNote}
            </p>
          )}
          {availability !== "complete" && (
            <DataAvailabilityNotice
              status={availability}
              message={
                availability === "missing"
                  ? "Numerator or denominator is missing — this indicator cannot be computed."
                  : "Some data is incomplete."
              }
              compact
            />
          )}
          {children}
        </KpiCard>
      )}
    </div>
  );
}
