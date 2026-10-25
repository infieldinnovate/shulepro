import type { ReactNode } from "react";
import { CheckCircle2, Circle, CircleAlert, CircleSlash, CircleDashed } from "lucide-react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { BadgeVariant } from "@/components/ui/Badge";
import { formatAbsolute } from "@/lib/formatTime";
import type { AttainmentLevel, EvidenceStatus } from "@/components/features/assessment/types";
import styles from "./LearningOutcomeStatus.module.scss";

export interface LearningOutcomeStatusProps {
  outcomeLabel: string;
  evidenceStatus: EvidenceStatus;
  /** Attainment level key achieved (matches an AttainmentLevel.key). */
  levelKey?: string;
  /** Attainment levels for label lookup. */
  attainmentLevels?: AttainmentLevel[];
  description?: ReactNode;
  /** When the outcome was last assessed. */
  lastAssessedAt?: Date | string;
  className?: string;
}

const STATUS_CONFIG: Record<
  EvidenceStatus,
  {
    variant: BadgeVariant;
    label: string;
    icon: ReactNode;
  }
> = {
  "not-assessed": {
    variant: "neutral",
    label: "Not assessed",
    icon: <CircleDashed aria-hidden="true" size={16} />,
  },
  "insufficient-evidence": {
    variant: "warning",
    label: "Insufficient evidence",
    icon: <CircleSlash aria-hidden="true" size={16} />,
  },
  "not-yet-demonstrated": {
    variant: "error",
    label: "Not yet demonstrated",
    icon: <CircleAlert aria-hidden="true" size={16} />,
  },
  "partially-demonstrated": {
    variant: "info",
    label: "Partially demonstrated",
    icon: <Circle aria-hidden="true" size={16} />,
  },
  demonstrated: {
    variant: "success",
    label: "Demonstrated",
    icon: <CheckCircle2 aria-hidden="true" size={16} />,
  },
};

function findLevelLabel(
  levelKey?: string,
  levels?: AttainmentLevel[],
): { label: string; description?: string } | null {
  if (!levelKey || !levels) return null;
  const level = levels.find((l) => l.key === levelKey);
  if (!level) return null;
  return { label: level.label, description: level.description };
}

export function LearningOutcomeStatus({
  outcomeLabel,
  evidenceStatus,
  levelKey,
  attainmentLevels,
  description,
  lastAssessedAt,
  className,
}: LearningOutcomeStatusProps) {
  const config = STATUS_CONFIG[evidenceStatus];
  const levelInfo = findLevelLabel(levelKey, attainmentLevels);

  const dateText = lastAssessedAt
    ? formatAbsolute(
        typeof lastAssessedAt === "string"
          ? lastAssessedAt
          : lastAssessedAt.getTime(),
      )
    : null;

  return (
    <Card padded className={clsx(styles.card, className)}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.icon} aria-hidden="true">
            {config.icon}
          </span>
          <h4 className={styles.label}>{outcomeLabel}</h4>
        </div>
        <Badge variant={config.variant} size="sm" icon={config.icon}>
          {config.label}
        </Badge>
      </div>

      {description && (
        <p className={styles.description}>{description}</p>
      )}

      {levelInfo && (
        <div className={styles.levelInfo}>
          <span className={styles.levelLabel}>Level: </span>
          <span className={styles.levelValue}>{levelInfo.label}</span>
          {levelInfo.description && (
            <p className={styles.levelDescription}>
              {levelInfo.description}
            </p>
          )}
        </div>
      )}

      {dateText && (
        <p className={styles.lastAssessed}>
          Last assessed: <time>{dateText}</time>
        </p>
      )}
    </Card>
  );
}
