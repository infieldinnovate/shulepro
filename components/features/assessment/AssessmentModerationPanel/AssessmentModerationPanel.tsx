"use client";

import { useCallback } from "react";
import type { ReactNode } from "react";
import { ShieldCheck, CheckCircle2, RotateCcw, Clock } from "lucide-react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { BadgeVariant } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { ActivityTimeline } from "@/components/shared/ActivityTimeline";
import type { ActivityTimelineEvent } from "@/components/shared/ActivityTimeline";
import { ApprovalActions } from "@/components/shared/ApprovalActions";
import type { ApprovalAction } from "@/components/shared/ApprovalActions";
import { formatAbsolute } from "@/lib/formatTime";
import type { ModerationFinding } from "@/components/features/assessment/types";

function toTimestamp(value: Date | string | number): string | number {
  return value instanceof Date ? value.getTime() : value;
}
import styles from "./AssessmentModerationPanel.module.scss";

export type CorrectionStatus = ModerationFinding["correctionStatus"];

const STATUS_CONFIG: Record<
  CorrectionStatus,
  { variant: BadgeVariant; label: string; icon: ReactNode }
> = {
  pending: {
    variant: "warning",
    label: "Pending",
    icon: <Clock aria-hidden="true" size={14} />,
  },
  corrected: {
    variant: "success",
    label: "Corrected",
    icon: <CheckCircle2 aria-hidden="true" size={14} />,
  },
  upheld: {
    variant: "neutral",
    label: "Upheld",
    icon: <RotateCcw aria-hidden="true" size={14} />,
  },
};

export interface AssessmentModerationPanelProps {
  findings: ModerationFinding[];
  onAddFinding?: () => void;
  onUpdateFindingStatus?: (
    findingId: string,
    status: CorrectionStatus,
  ) => void;
  reviewers?: string[];
  loading?: boolean;
  error?: ReactNode;
  empty?: boolean;
  className?: string;
}

export function AssessmentModerationPanel({
  findings,
  onAddFinding,
  onUpdateFindingStatus,
  loading = false,
  error,
  empty = false,
  className,
}: AssessmentModerationPanelProps) {
  const buildActions = useCallback(
    (finding: ModerationFinding): ApprovalAction[] => {
      if (!onUpdateFindingStatus) return [];
      const actions: ApprovalAction[] = [];
      if (finding.correctionStatus !== "corrected") {
        actions.push({
          id: `correct-${finding.id}`,
          label: "Mark corrected",
          variant: "primary",
          icon: <CheckCircle2 aria-hidden="true" size={16} />,
          confirm: {
            title: "Mark as corrected?",
            description:
              "This will update the finding status to indicate the correction has been applied.",
            confirmLabel: "Mark corrected",
          },
          onSelect: () =>
            onUpdateFindingStatus(finding.id, "corrected"),
        });
      }
      if (finding.correctionStatus !== "upheld") {
        actions.push({
          id: `uphold-${finding.id}`,
          label: "Uphold",
          variant: "outline",
          icon: <RotateCcw aria-hidden="true" size={16} />,
          confirm: {
            title: "Uphold this finding?",
            description:
              "The original finding will be upheld without correction.",
            confirmLabel: "Uphold",
          },
          onSelect: () =>
            onUpdateFindingStatus(finding.id, "upheld"),
        });
      }
      if (finding.correctionStatus !== "pending") {
        actions.push({
          id: `reopen-${finding.id}`,
          label: "Reopen",
          variant: "ghost",
          icon: <Clock aria-hidden="true" size={16} />,
          confirm: {
            title: "Reopen this finding?",
            description:
              "The finding will be set back to pending for further review.",
            confirmLabel: "Reopen",
          },
          onSelect: () =>
            onUpdateFindingStatus(finding.id, "pending"),
        });
      }
      return actions;
    },
    [onUpdateFindingStatus],
  );

  if (loading) {
    return (
      <Card padded className={clsx(styles.container, className)}>
        <Spinner size="md" label="Loading moderation findings" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card padded className={clsx(styles.container, className)}>
        <Alert
          variant="error"
          title="Unable to load moderation findings"
          description={error}
        />
      </Card>
    );
  }

  if (empty || findings.length === 0) {
    return (
      <Card padded className={clsx(styles.container, className)}>
        <EmptyState
          icon={<ShieldCheck aria-hidden="true" />}
          title="No moderation findings"
          description="Moderation findings will appear here once they are recorded."
        />
      </Card>
    );
  }

  const timelineEvents: ActivityTimelineEvent[] = findings.map((f) => {
    const config = STATUS_CONFIG[f.correctionStatus];
    return {
      id: f.id,
      timestamp: toTimestamp(f.createdAt ?? new Date().toISOString()),
      title: config.label,
      description: f.finding,
      actor: f.reviewer ? { name: f.reviewer } : undefined,
      variant:
        f.correctionStatus === "corrected"
          ? "success"
          : f.correctionStatus === "pending"
            ? "warning"
            : "neutral",
    };
  });

  return (
    <div className={clsx(styles.container, className)}>
      <Card padded>
        <h4 className={styles.title}>Moderation timeline</h4>
        <ActivityTimeline
          events={timelineEvents}
          emptyTitle="No findings"
          emptyDescription="Moderation findings will appear here."
          ariaLabel="Moderation finding timeline"
        />
      </Card>

      <div className={styles.findingList}>
        {findings.map((finding) => {
          const config = STATUS_CONFIG[finding.correctionStatus];
          const actions = buildActions(finding);
          return (
            <Card key={finding.id} padded className={styles.findingCard}>
              <div className={styles.findingHeader}>
                <Badge
                  variant={config.variant}
                  size="sm"
                  icon={config.icon}
                >
                  {config.label}
                </Badge>
                {finding.reviewer && (
                  <span className={styles.reviewer}>
                    by {finding.reviewer}
                  </span>
                )}
                {finding.createdAt && (
                  <span className={styles.date}>
                    {formatAbsolute(toTimestamp(finding.createdAt))}
                  </span>
                )}
              </div>
              <p className={styles.findingText}>{finding.finding}</p>
              {finding.resolvedAt && (
                <p className={styles.resolvedAt}>
                  Resolved: {formatAbsolute(toTimestamp(finding.resolvedAt))}
                </p>
              )}
              {actions.length > 0 && (
                <ApprovalActions
                  actions={actions}
                  ariaLabel={`Actions for finding: ${finding.finding}`}
                  className={styles.actions}
                />
              )}
            </Card>
          );
        })}
      </div>

      {onAddFinding && (
        <button
          type="button"
          className={styles.addFindingBtn}
          onClick={onAddFinding}
        >
          <ShieldCheck aria-hidden="true" size={16} />
          Add finding
        </button>
      )}
    </div>
  );
}
