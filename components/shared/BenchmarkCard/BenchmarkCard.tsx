import type { ReactNode } from "react";
import { ArrowUp, ArrowDown, Minus, ArrowRight, Info } from "lucide-react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Alert } from "@/components/ui/Alert";
import type { BenchmarkResult, TrendDirection } from "@/lib/analytics";
import styles from "./BenchmarkCard.module.scss";

export interface BenchmarkCardProps {
  label: string;
  /** Current value. */
  value: number | null | undefined;
  /** Benchmark reference value. Pass null when no benchmark is available. */
  benchmark: number | null | undefined;
  /** Computed benchmark result from computeBenchmarkDelta(). */
  result: BenchmarkResult;
  /** Unit suffix (e.g. "%", "points"). */
  unit?: string;
  /** Format the numeric values for display (defaults to raw number). */
  formatValue?: (n: number) => string;
  /**
   * When true, being above the benchmark is bad (e.g. dropout rate).
   * Defaults to false (above benchmark = good).
   */
  invertPolarity?: boolean;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  description?: string;
  /** Optional definition tooltip node (typically a MetricDefinitionTooltip). */
  definition?: ReactNode;
  className?: string;
  children?: ReactNode;
}

const DIRECTION_ICON: Record<TrendDirection, ReactNode> = {
  up: <ArrowUp aria-hidden="true" />,
  down: <ArrowDown aria-hidden="true" />,
  flat: <Minus aria-hidden="true" />,
};

export function BenchmarkCard({
  label,
  value,
  benchmark,
  result,
  unit,
  formatValue,
  invertPolarity = false,
  loading = false,
  error,
  empty = false,
  description,
  definition,
  className,
  children,
}: BenchmarkCardProps) {
  const fmt = formatValue ?? ((n: number) => String(n));
  const hasBenchmark = result.direction != null;

  const body = (() => {
    if (loading) {
      return (
        <div className={styles.loadingBody}>
          <Spinner size="md" label={`Loading ${label}`} />
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="error" title="Data unavailable" description={error} />
      );
    }

    if (empty || value == null) {
      return (
        <EmptyState
          icon={<Info aria-hidden="true" />}
          title="No data yet"
          description={`There is no data available for ${label.toLowerCase()} yet.`}
        />
      );
    }

    let deltaTone: "positive" | "negative" | "neutral" | "unknown";
    if (!hasBenchmark) {
      deltaTone = "unknown";
    } else if (result.direction === "flat") {
      deltaTone = "neutral";
    } else {
      const isUp = result.direction === "up";
      const isGood = invertPolarity ? !isUp : isUp;
      deltaTone = isGood ? "positive" : "negative";
    }

    const deltaText =
      hasBenchmark && result.delta != null
        ? `${result.delta > 0 ? "+" : result.delta < 0 ? "\u2212" : ""}${fmt(Math.abs(result.delta))}${unit ? ` ${unit}` : ""}`
        : null;

    const ariaLabel = hasBenchmark
      ? `${label}: ${fmt(value)}${unit ? ` ${unit}` : ""} versus benchmark ${benchmark != null ? fmt(benchmark) : "unknown"}${unit ? ` ${unit}` : ""}${deltaText ? `, difference ${deltaText}` : ""}`
      : `${label}: ${fmt(value)}${unit ? ` ${unit}` : ""}, no benchmark available`;

    return (
      <div className={styles.content} role="img" aria-label={ariaLabel}>
        <div className={styles.valueRow}>
          <span className={styles.value}>
            {fmt(value)}
            {unit && <span className={styles.unit}> {unit}</span>}
          </span>
        </div>
        <div className={styles.benchmarkRow}>
          {hasBenchmark && benchmark != null ? (
            <>
              <span className={styles.benchmarkLabel}>
                Benchmark: {fmt(benchmark)}
                {unit && ` ${unit}`}
              </span>
              <span className={clsx(styles.delta, styles[deltaTone])}>
                {DIRECTION_ICON[result.direction!]}
                {deltaText && (
                  <span className={styles.deltaText}>{deltaText}</span>
                )}
              </span>
            </>
          ) : (
            <span className={styles.noBenchmark}>
              <ArrowRight aria-hidden="true" />
              <span>No benchmark available</span>
            </span>
          )}
        </div>
      </div>
    );
  })();

  return (
    <Card className={clsx(styles.card, className)} padded>
      <Card.Header className={styles.header}>
        <div className={styles.titleRow}>
          <h4 className={styles.title} title={description}>
            {label}
          </h4>
          {definition && (
            <span className={styles.definition}>{definition}</span>
          )}
        </div>
      </Card.Header>
      <Card.Body className={styles.body}>
        {body}
        {children}
      </Card.Body>
    </Card>
  );
}
