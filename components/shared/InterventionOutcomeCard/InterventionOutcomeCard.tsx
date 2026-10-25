import type { ReactNode } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  CircleSlash,
  Info,
} from "lucide-react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { StatusBadgeMap } from "@/components/shared/StatusBadge";
import {
  classifyDataPoint,
  computeTrend,
  formatDelta,
  formatPercentChange,
  type DataPresence,
} from "@/lib/analytics";
import styles from "./InterventionOutcomeCard.module.scss";

export type InterventionStatus =
  | "planned"
  | "in-progress"
  | "completed"
  | "on-hold"
  | "cancelled";

export type InterventionOutcome =
  | "improved"
  | "declined"
  | "no-change"
  | "no-reference"
  | "inconclusive";

export interface InterventionMeasure {
  id: string;
  label: string;
  unit?: string;
  /** Pre-intervention value. null/undefined means no baseline reference. */
  before: number | null | undefined;
  /** Post-intervention value. null/undefined means no data collected. */
  after: number | null | undefined;
  /** Whether an increase is desirable (true) or a decrease is desirable (false). */
  higherIsBetter?: boolean;
}

export interface InterventionOutcomeCardProps {
  title: string;
  description?: string;
  status: InterventionStatus;
  statusMap: StatusBadgeMap<InterventionStatus>;
  measures: InterventionMeasure[];
  /** Overall outcome determined by caller or derived from measures. */
  outcome: InterventionOutcome;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  emptyDescription?: string;
  onDrillDown?: () => void;
  className?: string;
  children?: ReactNode;
}

const OUTCOME_CONFIG: Record<
  InterventionOutcome,
  { variant: "success" | "error" | "neutral" | "warning"; label: string; icon: ReactNode }
> = {
  improved: {
    variant: "success",
    label: "Improved",
    icon: <TrendingUp aria-hidden="true" size={14} />,
  },
  declined: {
    variant: "error",
    label: "Declined",
    icon: <TrendingDown aria-hidden="true" size={14} />,
  },
  "no-change": {
    variant: "neutral",
    label: "No change",
    icon: <Minus aria-hidden="true" size={14} />,
  },
  "no-reference": {
    variant: "warning",
    label: "No baseline",
    icon: <CircleSlash aria-hidden="true" size={14} />,
  },
  inconclusive: {
    variant: "warning",
    label: "Inconclusive",
    icon: <Info aria-hidden="true" size={14} />,
  },
};

function presenceLabel(presence: DataPresence): string {
  switch (presence) {
    case "missing":
      return "No data";
    case "zero":
      return "0";
    default:
      return "";
  }
}

function formatMeasureValue(
  value: number | null | undefined,
  unit?: string,
): string {
  const presence = classifyDataPoint(value);
  if (presence !== "present") return presenceLabel(presence);
  const u = unit ? ` ${unit}` : "";
  return `${value}${u}`;
}

interface MeasureDelta {
  beforePresence: DataPresence;
  afterPresence: DataPresence;
  hasReference: boolean;
  trendLabel: string | null;
  percentLabel: string | null;
  /** Whether the change is in the desired direction. */
  isPositive: boolean | null;
}

function computeMeasureDelta(measure: InterventionMeasure): MeasureDelta {
  const beforePresence = classifyDataPoint(measure.before);
  const afterPresence = classifyDataPoint(measure.after);
  const hasReference = beforePresence === "present" || beforePresence === "zero";

  const trend = computeTrend(measure.after, measure.before);
  const trendLabel = formatDelta(trend.delta, 1);
  const percentLabel = formatPercentChange(trend.percentChange, 1);

  let isPositive: boolean | null = null;
  if (trend.direction !== null) {
    const higherIsBetter = measure.higherIsBetter ?? true;
    if (trend.direction === "flat") {
      isPositive = null;
    } else {
      const isUp = trend.direction === "up";
      isPositive = higherIsBetter ? isUp : !isUp;
    }
  }

  return {
    beforePresence,
    afterPresence,
    hasReference,
    trendLabel,
    percentLabel,
    isPositive,
  };
}

export function InterventionOutcomeCard({
  title,
  description,
  status,
  statusMap,
  measures,
  outcome,
  loading = false,
  error,
  empty = false,
  emptyDescription,
  onDrillDown,
  className,
  children,
}: InterventionOutcomeCardProps) {
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
    if (empty || measures.length === 0) {
      return (
        <EmptyState
          icon={<Info aria-hidden="true" />}
          title="No outcome measures"
          description={emptyDescription ?? `There are no intervention measures recorded for ${title.toLowerCase()} yet.`}
        />
      );
    }
    return (
      <ul className={styles.measureList} aria-label={`Outcome measures for ${title}`}>
        {measures.map((measure) => {
          const delta = computeMeasureDelta(measure);
          const unitSuffix = measure.unit ? ` ${measure.unit}` : "";

          return (
            <li key={measure.id} className={styles.measureItem}>
              <span className={styles.measureLabel}>{measure.label}</span>
              <div className={styles.measureValues}>
                <div className={styles.valueCell}>
                  <span className={styles.valueLabel}>Before</span>
                  <span
                    className={clsx(
                      styles.value,
                      delta.beforePresence === "missing" && styles.valueMissing,
                    )}
                  >
                    {formatMeasureValue(measure.before, measure.unit)}
                  </span>
                </div>
                <span className={styles.arrow} aria-hidden="true">
                  &rarr;
                </span>
                <div className={styles.valueCell}>
                  <span className={styles.valueLabel}>After</span>
                  <span
                    className={clsx(
                      styles.value,
                      delta.afterPresence === "missing" && styles.valueMissing,
                    )}
                  >
                    {formatMeasureValue(measure.after, measure.unit)}
                  </span>
                </div>
                <div className={styles.deltaCell}>
                  {delta.hasReference && delta.trendLabel ? (
                    <>
                      <span
                        className={clsx(
                          styles.delta,
                          delta.isPositive === true && styles.deltaPositive,
                          delta.isPositive === false && styles.deltaNegative,
                          delta.isPositive === null && styles.deltaNeutral,
                        )}
                      >
                        {delta.trendLabel}
                        {unitSuffix}
                      </span>
                      {delta.percentLabel && (
                        <span className={styles.percentChange}>{delta.percentLabel}</span>
                      )}
                    </>
                  ) : !delta.hasReference ? (
                    <Badge variant="warning" size="sm">
                      No baseline
                    </Badge>
                  ) : (
                    <Badge variant="neutral" size="sm">
                      No data
                    </Badge>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    );
  })();

  const outcomeCfg = OUTCOME_CONFIG[outcome];
  const drillable = Boolean(onDrillDown);

  return (
    <Card className={clsx(styles.card, className)} padded>
      <Card.Header className={styles.header}>
        <div className={styles.headerText}>
          <h4 className={styles.title}>{title}</h4>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        <div className={styles.headerBadges}>
          <StatusBadge status={status} statusMap={statusMap} size="sm" />
          <Badge variant={outcomeCfg.variant} size="sm" icon={outcomeCfg.icon}>
            {outcomeCfg.label}
          </Badge>
        </div>
      </Card.Header>
      <Card.Body className={styles.body}>
        {body}
        {children}
      </Card.Body>
      {drillable && (
        <Card.Footer className={styles.footer}>
          <Button
            variant="ghost"
            size="sm"
            className={styles.drillDownButton}
            onClick={onDrillDown}
          >
            View intervention details
          </Button>
        </Card.Footer>
      )}
    </Card>
  );
}
