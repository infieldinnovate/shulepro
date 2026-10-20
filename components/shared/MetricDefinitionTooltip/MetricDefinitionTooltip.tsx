import type { ReactNode } from "react";
import { Circle as HelpCircle } from "lucide-react";
import { Tooltip } from "../../ui/Tooltip";
import { IconButton } from "../../ui/Button";
import styles from "./MetricDefinitionTooltip.module.scss";

export interface MetricDefinitionTooltipProps {
  /** Plain-language explanation of what the metric measures and how it is calculated. */
  content: ReactNode;
  /** Accessible name of the metric being defined. */
  metricName: string;
  className?: string;
}

export function MetricDefinitionTooltip({
  content,
  metricName,
  className,
}: MetricDefinitionTooltipProps) {
  return (
    <span className={className}>
      <Tooltip
        content={content}
        ariaLabel={`Definition of ${metricName}`}
        placement="top"
      >
        <IconButton
          variant="ghost"
          size="sm"
          label={`Show definition of ${metricName}`}
          className={styles.trigger}
        >
          <HelpCircle aria-hidden="true" />
        </IconButton>
      </Tooltip>
    </span>
  );
}
