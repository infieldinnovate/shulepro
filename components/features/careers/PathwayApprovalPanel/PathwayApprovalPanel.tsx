"use client";

import type { ReactNode } from "react";
import { Check, X, MessageSquare } from "lucide-react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApprovalActions } from "@/components/shared/ApprovalActions";
import type { ApprovalAction } from "@/components/shared/ApprovalActions";
import type { PathwayApprovalDecision } from "@/components/features/careers/types";
import styles from "./PathwayApprovalPanel.module.scss";

export interface PathwayApprovalPanelProps {
  /** Display label for the pathway being reviewed. */
  pathwayLabel: string;
  /** Optional summary of the case being reviewed. */
  summary?: string;
  /** Called when the reviewer makes an explicit decision. */
  onDecide: (decision: PathwayApprovalDecision) => void;
  /** Action currently in flight (shows spinner on that button). */
  processingActionId?: string | null;
  /** Disable all actions (e.g. after a decision has been recorded). */
  disabled?: boolean;
  /** Optional title override. */
  title?: string;
  /** When true, a decision has already been recorded. */
  decided?: boolean;
  /** Optional badge label for the recorded decision. */
  decisionLabel?: string;
  /** Optional badge variant for the recorded decision. */
  decisionVariant?: "neutral" | "success" | "error" | "warning" | "info" | "primary";
  loading?: boolean;
  error?: ReactNode;
  /** Optional content rendered above the actions (e.g. review notes). */
  children?: ReactNode;
  className?: string;
}

function buildActions(
  onDecide: (decision: PathwayApprovalDecision) => void,
  disabled: boolean,
): ApprovalAction[] {
  return [
    {
      id: "request-changes",
      label: "Request changes",
      variant: "outline",
      icon: <MessageSquare aria-hidden="true" />,
      confirm: {
        title: "Request changes?",
        description:
          "The learner will be asked to revise their pathway selections. You can add notes after confirming.",
        confirmLabel: "Request changes",
        destructive: false,
      },
      onSelect: () => onDecide("request-changes"),
      disabled,
    },
    {
      id: "reject",
      label: "Reject",
      variant: "destructive",
      icon: <X aria-hidden="true" />,
      confirm: {
        title: "Reject this pathway allocation?",
        description:
          "This will decline the proposed pathway. A rationale should be recorded for the learner.",
        confirmLabel: "Reject",
        destructive: true,
      },
      onSelect: () => onDecide("reject"),
      disabled,
    },
    {
      id: "approve",
      label: "Approve",
      variant: "primary",
      icon: <Check aria-hidden="true" />,
      confirm: {
        title: "Approve this pathway allocation?",
        description:
          "This will finalize the learner's pathway. Ensure all eligibility criteria have been reviewed.",
        confirmLabel: "Approve",
        destructive: false,
      },
      onSelect: () => onDecide("approve"),
      disabled,
    },
  ];
}

export function PathwayApprovalPanel({
  pathwayLabel,
  summary,
  onDecide,
  processingActionId = null,
  disabled = false,
  title = "Pathway approval",
  decided = false,
  decisionLabel,
  decisionVariant = "neutral",
  loading = false,
  error,
  children,
  className,
}: PathwayApprovalPanelProps) {
  if (loading) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <div className={styles.loadingState}>
          <Spinner size="md" label="Loading approval panel" />
        </div>
      </Card>
    );
  }

  const actions = buildActions(onDecide, disabled || decided);

  return (
    <Card className={clsx(styles.card, className)} padded>
      <Card.Header className={styles.header}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>{title}</h3>
          {decided && decisionLabel && (
            <Badge variant={decisionVariant} size="sm">
              {decisionLabel}
            </Badge>
          )}
        </div>
        <p className={styles.pathwayLabel}>{pathwayLabel}</p>
        {summary && <p className={styles.summary}>{summary}</p>}
      </Card.Header>

      <Card.Body className={styles.body}>
        {error && (
          <Alert
            variant="error"
            title="Unable to record decision"
            description={error}
          />
        )}

        {decided ? (
          <EmptyState
            icon={<Check aria-hidden="true" />}
            title="Decision recorded"
            description="A decision has already been made for this pathway. No further action is required."
          />
        ) : (
          <Alert
            variant="info"
            title="Explicit human decision required"
            description="This pathway must be approved, rejected, or sent back for changes by a reviewer. No automatic allocation is applied from AI scores or recommendations."
          />
        )}

        {children}

        {!decided && (
          <ApprovalActions
            actions={actions}
            disabled={disabled}
            processingActionId={processingActionId}
            ariaLabel="Pathway approval actions"
            className={styles.actions}
          />
        )}
      </Card.Body>
    </Card>
  );
}
