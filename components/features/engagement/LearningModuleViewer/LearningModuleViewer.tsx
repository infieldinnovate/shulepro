import type { ReactNode } from "react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Clock, FileText, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import type { LearningModule, DisabledState } from "@/components/features/engagement/models";
import styles from "./LearningModuleViewer.module.scss";

export interface LearningModuleViewerProps {
  /** The module to display — supplied via props. */
  module?: LearningModule | null;
  /** Optional content sections rendered in the body. */
  content?: ReactNode;
  /** Position context (e.g. "Module 2 of 5"). */
  positionLabel?: string;
  /** Whether a previous module is available. */
  hasPrevious?: boolean;
  /** Whether a next module is available. */
  hasNext?: boolean;
  /** Whether this module is already completed. */
  completed?: boolean;
  /** Navigation callbacks — the component does not implement course delivery. */
  onPrevious?: () => void;
  onNext?: () => void;
  onComplete?: () => void;
  /** Optional labels for the navigation buttons. */
  previousLabel?: string;
  nextLabel?: string;
  completeLabel?: string;
  /** Loading state. */
  loading?: boolean;
  /** Error message. */
  error?: string;
  /** Empty state. */
  empty?: boolean;
  /** Disabled state. */
  disabled?: DisabledState;
  className?: string;
}

export function LearningModuleViewer({
  module,
  content,
  positionLabel,
  hasPrevious = false,
  hasNext = false,
  completed = false,
  onPrevious,
  onNext,
  onComplete,
  previousLabel = "Previous",
  nextLabel = "Next",
  completeLabel = "Mark complete",
  loading = false,
  error,
  empty = false,
  disabled,
  className,
}: LearningModuleViewerProps) {
  if (loading) {
    return (
      <Card padded className={clsx(styles.loading, className)}>
        <Spinner size="md" label="Loading module" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card padded className={className}>
        <Alert variant="error" title="Module unavailable" description={error} />
      </Card>
    );
  }

  if (empty || !module) {
    return (
      <Card padded className={clsx(styles.empty, className)}>
        <EmptyState
          icon={<FileText aria-hidden="true" />}
          title="No module"
          description="No learning module to display."
        />
      </Card>
    );
  }

  const isDisabled = Boolean(disabled?.disabled);

  return (
    <Card
      padded={false}
      className={clsx(
        styles.viewer,
        isDisabled && styles.disabled,
        className,
      )}
      aria-disabled={isDisabled || undefined}
    >
      <div className={styles.body}>
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            {positionLabel && (
              <p className={styles.position}>{positionLabel}</p>
            )}
            <h3 className={styles.title}>{module.title}</h3>
          </div>
          {completed && (
            <span className={styles.completedBadge}>
              <CheckCircle aria-hidden="true" />
              <span>Completed</span>
            </span>
          )}
        </div>

        {module.description && (
          <p className={styles.description}>{module.description}</p>
        )}

        {module.durationLabel && (
          <div className={styles.duration}>
            <Clock aria-hidden="true" />
            <span>{module.durationLabel}</span>
          </div>
        )}

        {module.contentUrl && (
          <a
            href={module.contentUrl}
            className={styles.contentLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FileText aria-hidden="true" />
            <span>Open resource</span>
          </a>
        )}

        {content && <div className={styles.content}>{content}</div>}

        {isDisabled && disabled?.disabledReason && (
          <p className={styles.disabledReason}>{disabled.disabledReason}</p>
        )}
      </div>

      <div className={styles.footer}>
        <Button
          variant="ghost"
          size="sm"
          disabled={isDisabled || !hasPrevious}
          leftIcon={<ChevronLeft aria-hidden="true" />}
          onClick={onPrevious}
        >
          {previousLabel}
        </Button>

        <div className={styles.footerRight}>
          {!completed && onComplete && (
            <Button
              variant="secondary"
              size="sm"
              disabled={isDisabled}
              leftIcon={<CheckCircle aria-hidden="true" />}
              onClick={onComplete}
            >
              {completeLabel}
            </Button>
          )}
          {hasNext && (
            <Button
              variant="primary"
              size="sm"
              disabled={isDisabled}
              rightIcon={<ChevronRight aria-hidden="true" />}
              onClick={onNext}
            >
              {nextLabel}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
