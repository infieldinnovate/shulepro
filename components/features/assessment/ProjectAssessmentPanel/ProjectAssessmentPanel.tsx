import type { ReactNode } from "react";
import { FolderOpen } from "lucide-react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { WorkflowStepper } from "@/components/shared/WorkflowStepper";
import type { WorkflowStep, WorkflowStepStatus } from "@/components/shared/WorkflowStepper";
import { AttachmentList } from "@/components/shared/AttachmentList";
import type { Attachment } from "@/components/shared/AttachmentList";
import { AssessmentStatusBadge } from "@/components/features/assessment/AssessmentStatusBadge";
import type { AssessmentActivity, EvidenceItem, ProjectPhase } from "@/components/features/assessment/types";
import styles from "./ProjectAssessmentPanel.module.scss";

export interface ProjectAssessmentPanelProps {
  /** The project assessment activity, extended with optional phases. */
  project: AssessmentActivity;
  /** Phases supplied via props — not invented here. */
  phases?: ProjectPhase[];
  /** All evidence items available for this project. */
  evidenceItems: EvidenceItem[];
  /** Called when the user requests to add evidence to a phase. */
  onAddEvidence?: (phase: ProjectPhase) => void;
  /** Called when the user requests to review a phase. */
  onReviewPhase?: (phase: ProjectPhase) => void;
  /** Called when a phase is selected. */
  onSelectPhase?: (phase: ProjectPhase) => void;
  loading?: boolean;
  error?: ReactNode;
  empty?: boolean;
  className?: string;
}

const PHASE_STATUS_MAP: Record<string, WorkflowStepStatus> = {
  "not-assessed": "pending",
  "in-progress": "current",
  submitted: "completed",
  moderated: "completed",
  published: "completed",
  draft: "pending",
};

function evidenceToAttachments(
  items: EvidenceItem[],
): Attachment[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    size: item.size ?? 0,
    type: item.type,
    url: item.url,
    uploadedAt: item.uploadedAt
      ? typeof item.uploadedAt === "string"
        ? item.uploadedAt
        : item.uploadedAt.getTime()
      : undefined,
    uploadedBy: item.uploadedBy,
  }));
}

export function ProjectAssessmentPanel({
  project,
  phases = [],
  evidenceItems,
  onAddEvidence,
  onReviewPhase,
  onSelectPhase,
  loading = false,
  error,
  empty = false,
  className,
}: ProjectAssessmentPanelProps) {
  if (loading) {
    return (
      <Card padded className={clsx(styles.container, styles.loading, className)}>
        <Spinner size="md" label="Loading project assessment" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card padded className={clsx(styles.container, className)}>
        <Alert
          variant="error"
          title="Unable to load project assessment"
          description={error}
        />
      </Card>
    );
  }

  if (empty || !project) {
    return (
      <Card padded className={clsx(styles.container, className)}>
        <EmptyState
          icon={<FolderOpen aria-hidden="true" />}
          title="No project assessment"
          description="There is no project assessment to display."
        />
      </Card>
    );
  }

  const completedPhases = phases.filter(
    (p) => p.status === "submitted" || p.status === "moderated" || p.status === "published",
  ).length;
  const progressValue =
    phases.length > 0
      ? Math.round((completedPhases / phases.length) * 100)
      : 0;

  const workflowSteps: WorkflowStep[] = phases.map((phase) => ({
    id: phase.id,
    label: phase.label,
    description: phase.description,
    status: PHASE_STATUS_MAP[phase.status] ?? "pending",
  }));

  const evidenceById = new Map(evidenceItems.map((e) => [e.id, e]));

  return (
    <div className={clsx(styles.container, className)}>
      <Card padded>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <h3 className={styles.title}>{project.title}</h3>
            <AssessmentStatusBadge status={project.status} size="sm" />
          </div>
          {project.description && (
            <p className={styles.description}>{project.description}</p>
          )}
          {phases.length > 0 && (
            <Progress
              value={progressValue}
              label="Project completion"
              valueText={`${progressValue} percent complete`}
              size="sm"
              className={styles.progress}
            />
          )}
        </div>
      </Card>

      {phases.length === 0 ? (
        <Card padded>
          <EmptyState
            icon={<FolderOpen aria-hidden="true" />}
            title="No project phases"
            description="Project phases will appear here once they are configured."
          />
        </Card>
      ) : (
        <>
          <Card padded className={styles.phasesCard}>
            <h4 className={styles.sectionTitle}>Project phases</h4>
            <WorkflowStepper steps={workflowSteps} orientation="vertical" />
          </Card>

          <div className={styles.phaseDetails}>
            {phases.map((phase) => {
              const phaseEvidence = (phase.evidenceRefs ?? [])
                .map((ref) => evidenceById.get(ref))
                .filter((e): e is EvidenceItem => e != null);

              return (
                <Card key={phase.id} padded className={styles.phaseCard}>
                  <div className={styles.phaseHeader}>
                    <div className={styles.phaseTitleRow}>
                      <h5 className={styles.phaseLabel}>{phase.label}</h5>
                      <Badge variant="neutral" size="sm">
                        {phaseEvidence.length} evidence
                      </Badge>
                    </div>
                    {phase.description && (
                      <p className={styles.phaseDescription}>
                        {phase.description}
                      </p>
                    )}
                  </div>

                  {phaseEvidence.length > 0 ? (
                    <AttachmentList
                      attachments={evidenceToAttachments(phaseEvidence)}
                      ariaLabel={`Evidence for ${phase.label}`}
                      className={styles.evidenceList}
                    />
                  ) : (
                    <p className={styles.noEvidence}>
                      No evidence collected for this phase yet.
                    </p>
                  )}

                  <div className={styles.phaseActions}>
                    {onSelectPhase && (
                      <button
                        type="button"
                        className={styles.phaseActionBtn}
                        onClick={() => onSelectPhase(phase)}
                      >
                        View
                      </button>
                    )}
                    {onAddEvidence && (
                      <button
                        type="button"
                        className={styles.phaseActionBtn}
                        onClick={() => onAddEvidence(phase)}
                      >
                        Add evidence
                      </button>
                    )}
                    {onReviewPhase && (
                      <button
                        type="button"
                        className={styles.phaseActionBtn}
                        onClick={() => onReviewPhase(phase)}
                      >
                        Review
                      </button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
