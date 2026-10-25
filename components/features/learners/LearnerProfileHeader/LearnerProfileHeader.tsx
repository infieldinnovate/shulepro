import type { ReactNode } from "react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { LearnerAvatar } from "@/components/features/learners/LearnerAvatar";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Alert } from "@/components/ui/Alert";
import { UserX } from "lucide-react";
import type { Learner } from "@/components/features/learners/types";
import styles from "./LearnerProfileHeader.module.scss";

export interface LearnerProfileHeaderProps {
  learner?: Learner | null;
  /** Optional breadcrumb slot rendered above the header. */
  breadcrumbs?: ReactNode;
  /** Optional description text below the name. */
  description?: ReactNode;
  /** Enrolment status badge slot — caller provides this. */
  status?: ReactNode;
  /** Action buttons slot. */
  actions?: ReactNode;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  className?: string;
}

export function LearnerProfileHeader({
  learner,
  breadcrumbs,
  description,
  status,
  actions,
  loading = false,
  error,
  empty = false,
  className,
}: LearnerProfileHeaderProps) {
  if (loading) {
    return (
      <Card padded className={clsx(styles.loading, className)}>
        <Spinner size="lg" label="Loading learner profile" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card padded className={className}>
        <Alert variant="error" title="Profile unavailable" description={error} />
      </Card>
    );
  }

  if (empty || !learner) {
    return (
      <Card padded className={clsx(styles.empty, className)}>
        <EmptyState
          icon={<UserX aria-hidden="true" />}
          title="No learner"
          description="No learner profile to display."
        />
      </Card>
    );
  }

  const gradeClass = [learner.enrolment?.gradeLabel, learner.enrolment?.classLabel]
    .filter(Boolean)
    .join(" · ");

  return (
    <Card padded={false} className={clsx(styles.header, className)}>
      {breadcrumbs && <div className={styles.breadcrumbs}>{breadcrumbs}</div>}
      <div className={styles.main}>
        <LearnerAvatar
          learner={learner}
          size="xl"
          status={learner.enrolment?.status}
        />
        <div className={styles.info}>
          <div className={styles.nameRow}>
            <h2 className={styles.name}>{learner.name}</h2>
            {status && <span className={styles.status}>{status}</span>}
          </div>
          {gradeClass && <p className={styles.gradeClass}>{gradeClass}</p>}
          {description && <p className={styles.description}>{description}</p>}
          {(learner.identifiers?.displayLabel ||
            (learner.identifiers?.alternateIds &&
              learner.identifiers.alternateIds.length > 0)) && (
            <div className={styles.identifiers}>
              {learner.identifiers?.displayLabel && (
                <span className={styles.identifier}>
                  <span className={styles.identifierLabel}>ID: </span>
                  {learner.identifiers.displayLabel}
                </span>
              )}
              {learner.identifiers?.alternateIds?.map((alt) => (
                <span key={alt.label} className={styles.identifier}>
                  <span className={styles.identifierLabel}>{alt.label}: </span>
                  {alt.value}
                </span>
              ))}
            </div>
          )}
          {learner.meta && learner.meta.length > 0 && (
            <dl className={styles.metaList}>
              {learner.meta.map((m) => (
                <div key={m.label} className={styles.metaItem}>
                  <dt className={styles.metaLabel}>{m.label}</dt>
                  <dd className={styles.metaValue}>{m.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </Card>
  );
}
