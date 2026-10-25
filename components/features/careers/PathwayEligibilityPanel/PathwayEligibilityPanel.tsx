import type { ReactNode } from "react";
import { CheckCircle2, XCircle, HelpCircle, MinusCircle } from "lucide-react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import type { BadgeVariant } from "@/components/ui/Badge";
import type {
  PathwayEligibility,
  PathwayEligibilityCriterion,
  PathwayEligibilityStatus,
} from "@/components/features/careers/types";
import styles from "./PathwayEligibilityPanel.module.scss";

export interface PathwayEligibilityPanelProps {
  /** Configurable eligibility assessment to display. */
  eligibility: PathwayEligibility | null;
  /** Optional title override. */
  title?: string;
  loading?: boolean;
  error?: string;
  /** Optional content rendered below the criteria list. */
  children?: ReactNode;
  className?: string;
}

const STATUS_BADGE_VARIANT: Record<PathwayEligibilityStatus, BadgeVariant> = {
  met: "success",
  "not-met": "error",
  "insufficient-info": "warning",
  "not-applicable": "neutral",
};

const STATUS_LABEL: Record<PathwayEligibilityStatus, string> = {
  met: "Met",
  "not-met": "Not met",
  "insufficient-info": "Insufficient information",
  "not-applicable": "Not applicable",
};

function StatusIcon({ status }: { status: PathwayEligibilityStatus }) {
  switch (status) {
    case "met":
      return <CheckCircle2 aria-hidden="true" className={styles.statusIconMet} />;
    case "not-met":
      return <XCircle aria-hidden="true" className={styles.statusIconNotMet} />;
    case "insufficient-info":
      return (
        <HelpCircle aria-hidden="true" className={styles.statusIconInsufficient} />
      );
    case "not-applicable":
      return (
        <MinusCircle aria-hidden="true" className={styles.statusIconNotApplicable} />
      );
  }
}

function CriterionRow({ criterion }: { criterion: PathwayEligibilityCriterion }) {
  return (
    <li className={styles.criterionRow}>
      <span className={styles.criterionIcon}>
        <StatusIcon status={criterion.status} />
      </span>
      <div className={styles.criterionContent}>
        <div className={styles.criterionHeader}>
          <span className={styles.criterionLabel}>{criterion.label}</span>
          <Badge
            variant={STATUS_BADGE_VARIANT[criterion.status]}
            size="sm"
          >
            {STATUS_LABEL[criterion.status]}
          </Badge>
        </div>
        {criterion.description && (
          <p className={styles.criterionDescription}>{criterion.description}</p>
        )}
        {criterion.explanation && (
          <p className={styles.criterionExplanation}>{criterion.explanation}</p>
        )}
      </div>
    </li>
  );
}

export function PathwayEligibilityPanel({
  eligibility,
  title = "Pathway eligibility",
  loading = false,
  error,
  children,
  className,
}: PathwayEligibilityPanelProps) {
  if (loading) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <div className={styles.loadingState}>
          <Spinner size="md" label="Loading eligibility information" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <Alert
          variant="error"
          title="Unable to load eligibility information"
          description={error}
        />
      </Card>
    );
  }

  if (!eligibility || eligibility.criteria.length === 0) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <EmptyState
          icon={<HelpCircle aria-hidden="true" />}
          title="No eligibility criteria available"
          description="Eligibility criteria will appear here once they are configured for this pathway."
        />
      </Card>
    );
  }

  const hasInsufficientInfo = eligibility.criteria.some(
    (c) => c.status === "insufficient-info",
  );

  return (
    <Card className={clsx(styles.card, className)} padded>
      <Card.Header className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.pathwayLabel}>{eligibility.pathwayLabel}</p>
        {eligibility.summary && (
          <p className={styles.summary}>{eligibility.summary}</p>
        )}
      </Card.Header>

      <Card.Body className={styles.body}>
        {hasInsufficientInfo && (
          <Alert
            variant="warning"
            title="Some criteria have insufficient information"
            description="A final eligibility determination cannot be made until all missing information is provided. No silent pass or fail is applied."
            className={styles.insufficientAlert}
          />
        )}

        <ul className={styles.criteriaList}>
          {eligibility.criteria.map((criterion) => (
            <CriterionRow key={criterion.id} criterion={criterion} />
          ))}
        </ul>

        {children}
      </Card.Body>
    </Card>
  );
}
