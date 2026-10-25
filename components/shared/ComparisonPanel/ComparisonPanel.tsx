import type { ReactNode } from "react";
import { Info, ArrowRight } from "lucide-react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table } from "@/components/ui/Table";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { TrendIndicator } from "@/components/shared/TrendIndicator";
import {
  computeTrend,
  classifyDataPoint,
  formatDelta,
  formatPercentChange,
  type TrendDirection,
  type DataPresence,
} from "@/lib/analytics";
import styles from "./ComparisonPanel.module.scss";

export type ComparisonSide = "current" | "reference";

export interface ComparisonMetric {
  key: string;
  label: string;
  current: number | null | undefined;
  reference: number | null | undefined;
  unit?: string;
  formatValue?: (n: number) => string;
  invertPolarity?: boolean;
  description?: string;
}

export interface ComparisonPanelProps {
  title: string;
  currentLabel: string;
  referenceLabel: string;
  metrics: ComparisonMetric[];
  loading?: boolean;
  error?: string;
  empty?: boolean;
  description?: string;
  summary?: string;
  className?: string;
  children?: ReactNode;
}

function defaultFormat(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

function presenceVariant(
  p: DataPresence,
): "neutral" | "warning" | "info" | undefined {
  if (p === "missing") return "warning";
  if (p === "zero") return "info";
  return undefined;
}

function presenceLabel(p: DataPresence, unit?: string): string | null {
  if (p === "missing") return "No data";
  if (p === "zero") return unit ? `0 ${unit}` : "Zero";
  return null;
}

export function ComparisonPanel({
  title,
  currentLabel,
  referenceLabel,
  metrics,
  loading = false,
  error,
  empty = false,
  description,
  summary,
  className,
  children,
}: ComparisonPanelProps) {
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
        <Alert variant="error" title="Data unavailable" description={error} />
      );
    }
    if (empty || metrics.length === 0) {
      return (
        <EmptyState
          icon={<Info aria-hidden="true" />}
          title="No comparison data"
          description={`There is no data available for ${title.toLowerCase()} yet.`}
        />
      );
    }
    return (
      <Table
        className={styles.tableWrap}
        caption={summary ?? `Comparing ${currentLabel} against ${referenceLabel}`}
      >
        <Table.Header>
          <Table.Row>
            <Table.Head className={styles.metricCol}>
              Metric
            </Table.Head>
            <Table.Head className={styles.valueCol}>
              {currentLabel}
            </Table.Head>
            <Table.Head className={styles.valueCol}>
              {referenceLabel}
            </Table.Head>
            <Table.Head className={styles.deltaCol}>
              Change
            </Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {metrics.map((m) => {
            const fmt = m.formatValue ?? defaultFormat;
            const trend = computeTrend(m.current, m.reference);
            const curPresence = classifyDataPoint(m.current);
            const refPresence = classifyDataPoint(m.reference);
            const hasReference = trend.direction != null;
            const unit = m.unit ?? "";
            const percentLabel = formatPercentChange(trend.percentChange);
            const deltaLabel = formatDelta(trend.delta);
            const curDisplay =
              curPresence === "present"
                ? `${fmt(m.current!)}${unit ? ` ${unit}` : ""}`
                : null;
            const refDisplay =
              refPresence === "present"
                ? `${fmt(m.reference!)}${unit ? ` ${unit}` : ""}`
                : null;
            const curPresenceLabel = presenceLabel(curPresence, m.unit);
            const refPresenceLabel = presenceLabel(refPresence, m.unit);

            return (
              <Table.Row key={m.key} className={styles.row}>
                <Table.Head scope="row" className={styles.metricCol} title={m.description}>
                  <span className={styles.metricLabel}>{m.label}</span>
                  {m.description && (
                    <span className={styles.metricDesc}>{m.description}</span>
                  )}
                </Table.Head>
                <Table.Cell className={styles.valueCol}>
                  {curDisplay != null ? (
                    <span className={styles.value}>{curDisplay}</span>
                  ) : (
                    <span className={styles.missingData}>
                      <Badge variant={presenceVariant(curPresence)} size="sm">
                        {curPresenceLabel}
                      </Badge>
                    </span>
                  )}
                </Table.Cell>
                <Table.Cell className={styles.valueCol}>
                  {refDisplay != null ? (
                    <span className={styles.value}>{refDisplay}</span>
                  ) : (
                    <span className={styles.missingData}>
                      <Badge variant={presenceVariant(refPresence)} size="sm">
                        {refPresenceLabel}
                      </Badge>
                    </span>
                  )}
                </Table.Cell>
                <Table.Cell className={styles.deltaCol}>
                  {hasReference ? (
                    <TrendIndicator
                      direction={trend.direction as TrendDirection}
                      percentLabel={percentLabel}
                      deltaLabel={deltaLabel || undefined}
                      invertPolarity={m.invertPolarity}
                      comparisonLabel={`${m.label} vs ${referenceLabel}`}
                    />
                  ) : (
                    <span
                      className={styles.noReference}
                      role="img"
                      aria-label={`No comparable reference for ${m.label}`}
                    >
                      <ArrowRight aria-hidden="true" size={14} />
                      <span className={styles.noReferenceText}>
                        No comparable reference
                      </span>
                    </span>
                  )}
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    );
  })();

  return (
    <Card className={clsx(styles.card, className)} padded>
      <Card.Header className={styles.header}>
        <div className={styles.headerInner}>
          <h4 className={styles.title}>{title}</h4>
          {description && <p className={styles.description}>{description}</p>}
        </div>
      </Card.Header>
      <Card.Body className={styles.body}>
        {body}
        {children}
      </Card.Body>
    </Card>
  );
}
