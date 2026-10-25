import type { ReactNode } from "react";
import { KpiCard } from "@/components/shared/KpiCard";
import type { KpiCardStatus, KpiCardTrend } from "@/components/shared/KpiCard";
import type { AttainmentLevel, EvidenceStatus } from "@/components/features/assessment/types";
import type { TrendDirection } from "@/lib/analytics";

/** Status that can drive the card's visual tone. */
export type ProgressMeasureStatus = EvidenceStatus | KpiCardStatus;

export interface CompetencyProgressCardProps {
  label: string;
  /** Pre-calculated result value. Never derived from display strings. */
  value: number | null;
  /** Optional target value. */
  target?: number | null;
  /** Optional unit suffix (e.g. "%"). */
  unit?: string;
  /** Pre-computed trend — do NOT call computeTrend inside this component. */
  trend?: {
    direction: TrendDirection | null;
    percentLabel?: string | null;
    deltaLabel?: string | null;
    invertPolarity?: boolean;
  };
  /** Status to drive the card tone. */
  status?: ProgressMeasureStatus;
  /** Attainment levels for context (not used to derive outcomes). */
  attainmentLevels?: AttainmentLevel[];
  description?: string;
  loading?: boolean;
  error?: ReactNode;
  empty?: boolean;
  className?: string;
  children?: ReactNode;
}

function resolveCardStatus(
  status?: ProgressMeasureStatus,
): KpiCardStatus {
  if (!status) return "neutral";
  switch (status) {
    case "demonstrated":
    case "good":
      return "good";
    case "partially-demonstrated":
    case "warning":
      return "warning";
    case "not-yet-demonstrated":
    case "insufficient-evidence":
    case "critical":
      return "critical";
    default:
      return "neutral";
  }
}

export function CompetencyProgressCard({
  label,
  value,
  target,
  unit,
  trend,
  status,
  description,
  loading = false,
  error,
  empty = false,
  className,
  children,
}: CompetencyProgressCardProps) {
  const cardStatus = resolveCardStatus(status);

  const kpiTrend: KpiCardTrend | undefined = trend
    ? {
        direction: trend.direction,
        percentLabel: trend.percentLabel,
        deltaLabel: trend.deltaLabel,
        invertPolarity: trend.invertPolarity,
      }
    : undefined;

  const targetProp =
    target != null
      ? { label: "Target", value: String(target) }
      : undefined;

  const errorStr =
    typeof error === "string" ? error : error ? String(error) : undefined;

  return (
    <KpiCard
      title={label}
      value={value ?? null}
      unit={unit}
      trend={kpiTrend}
      target={targetProp}
      status={cardStatus}
      loading={loading}
      error={errorStr}
      empty={empty || value == null}
      description={description}
      className={className}
    >
      {children}
    </KpiCard>
  );
}
