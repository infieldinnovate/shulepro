import type { ReactNode } from "react";
import { Check, Lock, RotateCcw, Minus } from "lucide-react";
import clsx from "clsx";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import type { BadgeVariant } from "@/components/ui/Badge";
import styles from "./WorkflowStepper.module.scss";

export type WorkflowStepStatus =
  | "completed"
  | "current"
  | "pending"
  | "blocked"
  | "returned";

export type WorkflowOrientation = "vertical" | "horizontal";

export interface WorkflowStepAssignee {
  name: string;
  avatarSrc?: string;
  initials?: string;
}

export interface WorkflowStep {
  id: string;
  label: ReactNode;
  description?: ReactNode;
  status: WorkflowStepStatus;
  assignee?: WorkflowStepAssignee;
  /** Optional explicit badge label; defaults to a humanized status. */
  statusBadge?: ReactNode;
}

export interface WorkflowStepperProps {
  steps: WorkflowStep[];
  orientation?: WorkflowOrientation;
  ariaLabel?: string;
  className?: string;
}

const STATUS_BADGE_VARIANT: Record<WorkflowStepStatus, BadgeVariant> = {
  completed: "success",
  current: "primary",
  pending: "neutral",
  blocked: "error",
  returned: "warning",
};

const STATUS_BADGE_LABEL: Record<WorkflowStepStatus, string> = {
  completed: "Completed",
  current: "In progress",
  pending: "Pending",
  blocked: "Blocked",
  returned: "Returned",
};

function statusMarker(status: WorkflowStepStatus): ReactNode {
  switch (status) {
    case "completed":
      return <Check aria-hidden="true" />;
    case "blocked":
      return <Lock aria-hidden="true" />;
    case "returned":
      return <RotateCcw aria-hidden="true" />;
    case "pending":
      return <Minus aria-hidden="true" />;
    case "current":
    default:
      return null;
  }
}

export function WorkflowStepper({
  steps,
  orientation = "vertical",
  ariaLabel = "Workflow stages",
  className,
}: WorkflowStepperProps) {
  if (steps.length === 0) return null;

  return (
    <ol
      className={clsx(styles.list, styles[orientation], className)}
      aria-label={ariaLabel}
    >
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const marker = statusMarker(step.status);
        const badge =
          step.statusBadge ?? STATUS_BADGE_LABEL[step.status];

        const connectorClass = clsx(
          styles.connector,
          step.status === "completed" && styles.completed,
          step.status === "returned" && styles.returned,
          step.status === "blocked" && styles.blocked,
        );

        return (
          <li
            key={step.id}
            className={clsx(styles.item, styles[step.status])}
            aria-current={step.status === "current" ? "step" : undefined}
          >
            <div className={styles.row}>
              <span className={styles.marker} aria-hidden="true">
                {marker ?? index + 1}
              </span>
              <div className={styles.contentBlock}>
                <div className={styles.titleRow}>
                  <span className={styles.label}>{step.label}</span>
                  <Badge
                    variant={STATUS_BADGE_VARIANT[step.status]}
                    size="sm"
                    className={styles.statusBadge}
                  >
                    {badge}
                  </Badge>
                </div>
                {step.description && (
                  <p className={styles.description}>{step.description}</p>
                )}
                {step.assignee && (
                  <span className={styles.assignee}>
                    <Avatar
                      name={step.assignee.initials ?? step.assignee.name}
                      src={step.assignee.avatarSrc}
                      alt={step.assignee.name}
                      size="sm"
                    />
                    <span className={styles.assigneeName}>
                      {step.assignee.name}
                    </span>
                  </span>
                )}
              </div>
            </div>
            {!isLast && (
              <span className={connectorClass} aria-hidden="true" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
