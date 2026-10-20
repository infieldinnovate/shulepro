import type { ReactNode } from "react";
import { ArrowUp, ArrowDown, Minus, ArrowRight } from "lucide-react";
import clsx from "clsx";
import type { TrendDirection } from "@/lib/analytics";
import styles from "./TrendIndicator.module.scss";

export interface TrendIndicatorProps {
  /** Computed trend direction, or `null` when there is no comparable reference. */
  direction: TrendDirection | null;
  /** Signed percentage string (e.g. "+12.5%"). Omit when no valid reference. */
  percentLabel?: string | null;
  /** Optional signed delta string (e.g. "+12"). Rendered alongside percentage when provided. */
  deltaLabel?: string | null;
  /**
   * When true, an upward direction is interpreted as negative (e.g. "absence
   * rate going up is bad"). Defaults to `false`.
   */
  invertPolarity?: boolean;
  /** Accessible description of what the trend compares. */
  comparisonLabel?: string;
  className?: string;
}

const ICONS: Record<TrendDirection, ReactNode> = {
  up: <ArrowUp aria-hidden="true" />,
  down: <ArrowDown aria-hidden="true" />,
  flat: <Minus aria-hidden="true" />,
};

const NO_REFERENCE_ICON = <ArrowRight aria-hidden="true" />;

export function TrendIndicator({
  direction,
  percentLabel,
  deltaLabel,
  invertPolarity = false,
  comparisonLabel,
  className,
}: TrendIndicatorProps) {
  const hasReference = direction != null;

  let tone: "positive" | "negative" | "neutral" | "unknown";
  if (!hasReference) {
    tone = "unknown";
  } else if (direction === "flat") {
    tone = "neutral";
  } else {
    const isUp = direction === "up";
    const isGood = invertPolarity ? !isUp : isUp;
    tone = isGood ? "positive" : "negative";
  }

  const icon = hasReference ? ICONS[direction] : NO_REFERENCE_ICON;

  let ariaLabel: string;
  if (!hasReference) {
    ariaLabel = comparisonLabel
      ? `No comparable reference available for ${comparisonLabel}`
      : "No comparable reference available";
  } else {
    const dirWord =
      direction === "up" ? "up" : direction === "down" ? "down" : "flat";
    const parts = [`Trend: ${dirWord}`];
    if (percentLabel) parts.push(percentLabel);
    if (deltaLabel) parts.push(`(${deltaLabel})`);
    if (comparisonLabel) parts.push(`compared to ${comparisonLabel}`);
    ariaLabel = parts.join(" ");
  }

  return (
    <span
      className={clsx(styles.trend, styles[tone], className)}
      role="img"
      aria-label={ariaLabel}
    >
      <span className={styles.icon}>{icon}</span>
      {percentLabel && <span className={styles.percent}>{percentLabel}</span>}
      {deltaLabel && <span className={styles.delta}>{deltaLabel}</span>}
    </span>
  );
}
