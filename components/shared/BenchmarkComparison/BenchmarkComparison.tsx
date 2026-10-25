import type { ReactNode } from "react";
import { Info } from "lucide-react";
import clsx from "clsx";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Alert } from "@/components/ui/Alert";
import { BenchmarkCard } from "@/components/shared/BenchmarkCard";
import { computeBenchmarkDelta } from "@/lib/analytics";
import styles from "./BenchmarkComparison.module.scss";

/** A single benchmark entry to compare the value against. */
export interface BenchmarkEntry {
  /** Stable unique key. */
  key: string;
  /** Label for the benchmark (e.g. "Cluster average", "National average"). */
  label: string;
  /** The benchmark reference value. `null`/`undefined` = no benchmark available. */
  benchmark: number | null | undefined;
  /** Optional description of what the benchmark represents. */
  description?: string;
  /**
   * When true, being above the benchmark is bad (e.g. dropout rate).
   * Defaults to `false`.
   */
  invertPolarity?: boolean;
  /** Optional definition tooltip node for this benchmark. */
  definition?: ReactNode;
}

export interface BenchmarkComparisonProps {
  /** Label for the metric being compared (e.g. "Average math score"). */
  label: string;
  /** The current value. `null`/`undefined` = missing data. */
  value: number | null | undefined;
  /** One or more benchmarks to compare against. */
  benchmarks: BenchmarkEntry[];
  /** Unit suffix (e.g. "%", "points"). */
  unit?: string;
  /** Format the numeric values for display. */
  formatValue?: (n: number) => string;
  /** Show a loading state. */
  loading?: boolean;
  /** Error message. */
  error?: string;
  /** When true (and not loading/error), render an empty state. */
  empty?: boolean;
  /** Optional description of the metric. */
  description?: string;
  /** Accessible summary. */
  summary?: string;
  className?: string;
  children?: ReactNode;
}

/**
 * Compares a single value against one or more benchmarks, composing
 * `BenchmarkCard` for each entry. All metric math is delegated to
 * `lib/analytics.ts` via `computeBenchmarkDelta`.
 */
export function BenchmarkComparison({
  label,
  value,
  benchmarks,
  unit,
  formatValue,
  loading = false,
  error,
  empty = false,
  description,
  summary,
  className,
  children,
}: BenchmarkComparisonProps) {
  const content = (() => {
    if (loading) {
      return (
        <div className={styles.loadingBody}>
          <Spinner size="md" label={`Loading ${label}`} />
        </div>
      );
    }
    if (error) {
      return <Alert variant="error" title="Data unavailable" description={error} />;
    }
    if (empty || benchmarks.length === 0) {
      return (
        <EmptyState
          icon={<Info aria-hidden="true" />}
          title="No benchmark data"
          description={`There is no benchmark data available for ${label.toLowerCase()} yet.`}
        />
      );
    }
    return (
      <div
        className={styles.grid}
        role="group"
        aria-label={summary ?? `${label} benchmark comparison`}
      >
        {benchmarks.map((b) => {
          const result = computeBenchmarkDelta(value, b.benchmark);
          return (
            <BenchmarkCard
              key={b.key}
              label={b.label}
              value={value}
              benchmark={b.benchmark}
              result={result}
              unit={unit}
              formatValue={formatValue}
              invertPolarity={b.invertPolarity}
              description={b.description}
              definition={b.definition}
              className={styles.cardItem}
            />
          );
        })}
      </div>
    );
  })();

  return (
    <section className={clsx(styles.section, className)} aria-label={label}>
      <div className={styles.header}>
        <h4 className={styles.title}>{label}</h4>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {content}
      {children}
    </section>
  );
}
