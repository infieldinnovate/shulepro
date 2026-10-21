import type { ReactNode } from "react";
import { ListChecks } from "lucide-react";
import clsx from "clsx";
import { Card } from "../../../ui/Card";
import { Spinner } from "../../../ui/Spinner";
import { Alert } from "../../../ui/Alert";
import { EmptyState } from "../../../ui/EmptyState";
import { WorkflowStepper } from "../../../shared/WorkflowStepper";
import type { WorkflowStep } from "../../../shared/WorkflowStepper";
import { StepIndicator } from "../../../shared/StepIndicator";
import type { StepIndicatorStep } from "../../../shared/StepIndicator";
import type { PathwayReviewStage } from "../types";
import styles from "./PathwayReviewStepper.module.scss";

export interface PathwayReviewStepperProps {
  /** Configurable review stages to display. */
  stages: PathwayReviewStage[];
  /** Optional title for the stepper section. */
  title?: string;
  /** Optional description shown under the title. */
  description?: string;
  /**
   * When provided, render an interactive StepIndicator (clickable steps)
   * in addition to the vertical WorkflowStepper. Steps with status
   * "blocked" are never clickable.
   */
  onStepClick?: (index: number) => void;
  /** Orientation of the detail stepper. Defaults to vertical. */
  orientation?: "vertical" | "horizontal";
  loading?: boolean;
  error?: string;
  /** Optional content rendered below the steppers. */
  children?: ReactNode;
  className?: string;
}

function mapToWorkflowStep(stage: PathwayReviewStage): WorkflowStep {
  return {
    id: stage.id,
    label: stage.label,
    description: stage.description,
    status: stage.status,
    assignee: stage.assigneeName
      ? {
          name: stage.assigneeName,
          avatarSrc: stage.assigneeAvatarSrc,
          initials: stage.assigneeInitials,
        }
      : undefined,
  };
}

function mapToStepIndicatorStep(stage: PathwayReviewStage): StepIndicatorStep {
  return {
    id: stage.id,
    label: stage.label,
    description: stage.description,
    status: stage.status,
  };
}

export function PathwayReviewStepper({
  stages,
  title = "Pathway review stages",
  description,
  onStepClick,
  orientation = "vertical",
  loading = false,
  error,
  children,
  className,
}: PathwayReviewStepperProps) {
  if (loading) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <div className={styles.loadingState}>
          <Spinner size="md" label="Loading review stages" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <Alert
          variant="error"
          title="Unable to load review stages"
          description={error}
        />
      </Card>
    );
  }

  if (stages.length === 0) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <EmptyState
          icon={<ListChecks aria-hidden="true" />}
          title="No review stages"
          description="Review stages will appear here once the pathway review process is configured."
        />
      </Card>
    );
  }

  const workflowSteps = stages.map(mapToWorkflowStep);
  const indicatorSteps = stages.map(mapToStepIndicatorStep);

  return (
    <Card className={clsx(styles.card, className)} padded>
      <Card.Header className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {description && (
          <p className={styles.description}>{description}</p>
        )}
      </Card.Header>

      <Card.Body className={styles.body}>
        {onStepClick && (
          <div className={styles.indicatorWrap}>
            <StepIndicator
              steps={indicatorSteps}
              onStepClick={onStepClick}
              ariaLabel="Review stage navigation"
            />
          </div>
        )}

        <WorkflowStepper
          steps={workflowSteps}
          orientation={orientation}
          ariaLabel="Pathway review stages"
          className={styles.stepper}
        />

        {children}
      </Card.Body>
    </Card>
  );
}
