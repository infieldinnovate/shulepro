import type { ReactNode } from "react";
import clsx from "clsx";
import { RecordSummaryCard } from "../../../shared/RecordSummaryCard";
import { LearnerAvatar } from "../LearnerAvatar";
import { Spinner } from "../../../ui/Spinner";
import { EmptyState } from "../../../ui/EmptyState";
import { Alert } from "../../../ui/Alert";
import { Card } from "../../../ui/Card";
import { UserX } from "lucide-react";
import type { Learner } from "../types";
import styles from "./LearnerSummaryCard.module.scss";

export interface LearnerSummaryCardProps {
  learner?: Learner | null;
  /** Extra meta entries rendered on the card. */
  meta?: ReactNode[];
  /** Action buttons or menu rendered inline-end. */
  actions?: ReactNode;
  /** Enrolment status badge node — caller provides this slot. */
  status?: ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  className?: string;
}

export function LearnerSummaryCard({
  learner,
  meta,
  actions,
  status,
  onClick,
  ariaLabel,
  loading = false,
  error,
  empty = false,
  className,
}: LearnerSummaryCardProps) {
  if (loading) {
    return (
      <Card padded className={clsx(styles.loadingCard, className)}>
        <Spinner size="md" label="Loading learner" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card padded className={className}>
        <Alert variant="error" title="Learner unavailable" description={error} />
      </Card>
    );
  }

  if (empty || !learner) {
    return (
      <Card padded className={clsx(styles.emptyCard, className)}>
        <EmptyState
          icon={<UserX aria-hidden="true" />}
          title="No learner selected"
          description="Select a learner to view their summary."
        />
      </Card>
    );
  }

  const gradeClass = [learner.enrolment?.gradeLabel, learner.enrolment?.classLabel]
    .filter(Boolean)
    .join(" · ");

  const defaultMeta: ReactNode[] = [];
  if (learner.identifiers?.displayLabel) {
    defaultMeta.push(
      <span className={styles.metaLabel}>
        {learner.identifiers.displayLabel}
      </span>,
    );
  }
  if (gradeClass) {
    defaultMeta.push(
      <span className={styles.metaLabel}>{gradeClass}</span>,
    );
  }
  if (learner.meta) {
    for (const m of learner.meta) {
      defaultMeta.push(
        <span className={styles.metaLabel}>
          {m.label}: {m.value}
        </span>,
      );
    }
  }

  const mergedMeta = [...defaultMeta, ...(meta ?? [])];

  return (
    <RecordSummaryCard
      avatar={
        <LearnerAvatar
          learner={learner}
          size="md"
          status={learner.enrolment?.status}
        />
      }
      title={learner.name}
      subtitle={gradeClass || undefined}
      meta={mergedMeta.length > 0 ? mergedMeta : undefined}
      status={status}
      actions={actions}
      onClick={onClick}
      ariaLabel={ariaLabel ?? `View ${learner.name}`}
      className={className}
    />
  );
}
