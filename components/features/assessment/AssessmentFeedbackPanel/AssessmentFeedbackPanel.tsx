"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { MessageSquarePlus, Pencil, Trash2 } from "lucide-react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { BadgeVariant } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button, IconButton } from "@/components/ui/Button";
import { CommentBox } from "@/components/shared/CommentBox";
import { formatAbsolute } from "@/lib/formatTime";
import type { AssessmentFeedback } from "@/components/features/assessment/types";
import styles from "./AssessmentFeedbackPanel.module.scss";

export type FeedbackType = NonNullable<AssessmentFeedback["type"]>;

const FEEDBACK_TYPE_CONFIG: Record<
  FeedbackType,
  { variant: BadgeVariant; label: string }
> = {
  formative: { variant: "info", label: "Formative" },
  summative: { variant: "primary", label: "Summative" },
  peer: { variant: "neutral", label: "Peer" },
  self: { variant: "success", label: "Self" },
};

const ALL_TYPES: FeedbackType[] = ["formative", "summative", "peer", "self"];

export interface AssessmentFeedbackPanelProps {
  feedback: AssessmentFeedback[];
  /** Called with text and type when new feedback is submitted. */
  onSubmitFeedback?: (text: string, type: FeedbackType) => void;
  /** Allowed feedback types. Defaults to all four. */
  feedbackTypes?: FeedbackType[];
  onEditFeedback?: (item: AssessmentFeedback) => void;
  onDeleteFeedback?: (item: AssessmentFeedback) => void;
  loading?: boolean;
  error?: ReactNode;
  empty?: boolean;
  className?: string;
}

export function AssessmentFeedbackPanel({
  feedback,
  onSubmitFeedback,
  feedbackTypes = ALL_TYPES,
  onEditFeedback,
  onDeleteFeedback,
  loading = false,
  error,
  empty = false,
  className,
}: AssessmentFeedbackPanelProps) {
  const [selectedType, setSelectedType] = useState<FeedbackType>(
    feedbackTypes[0] ?? "formative",
  );

  const handleSubmit = (text: string) => {
    onSubmitFeedback?.(text, selectedType);
  };

  if (loading) {
    return (
      <Card padded className={clsx(styles.container, className)}>
        <Spinner size="md" label="Loading feedback" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card padded className={clsx(styles.container, className)}>
        <Alert
          variant="error"
          title="Unable to load feedback"
          description={error}
        />
      </Card>
    );
  }

  if (empty && feedback.length === 0) {
    return (
      <Card padded className={clsx(styles.container, className)}>
        <EmptyState
          icon={<MessageSquarePlus aria-hidden="true" />}
          title="No feedback yet"
          description="Feedback entries will appear here once they are added."
        />
      </Card>
    );
  }

  return (
    <div className={clsx(styles.container, className)}>
      {onSubmitFeedback && (
        <Card padded className={styles.addCard}>
          <div className={styles.typeSelector}>
            <span className={styles.typeLabel}>Feedback type:</span>
            <div className={styles.typeChips}>
              {feedbackTypes.map((type) => {
                const config = FEEDBACK_TYPE_CONFIG[type];
                return (
                  <Button
                    key={type}
                    variant="ghost"
                    size="sm"
                    className={clsx(
                      styles.typeChip,
                      selectedType === type && styles.typeChipActive,
                    )}
                    onClick={() => setSelectedType(type)}
                    aria-pressed={selectedType === type}
                  >
                    <Badge variant={config.variant} size="sm">
                      {config.label}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </div>
          <CommentBox
            onSubmit={handleSubmit}
            placeholder="Write feedback for this submission..."
            submitLabel="Add feedback"
            label="New feedback"
            ariaLabel="Add assessment feedback"
          />
        </Card>
      )}

      <div className={styles.feedbackList}>
        {feedback.length === 0 ? (
          <EmptyState
            icon={<MessageSquarePlus aria-hidden="true" />}
            title="No feedback yet"
            description="Feedback entries will appear here once they are added."
          />
        ) : (
          feedback.map((item) => {
            const typeConfig = item.type
              ? FEEDBACK_TYPE_CONFIG[item.type]
              : null;
            return (
              <Card key={item.id} padded className={styles.feedbackItem}>
                <div className={styles.itemHeader}>
                  <div className={styles.itemMeta}>
                    {typeConfig && (
                      <Badge variant={typeConfig.variant} size="sm">
                        {typeConfig.label}
                      </Badge>
                    )}
                    {item.author && (
                      <span className={styles.author}>{item.author}</span>
                    )}
                    {item.createdAt && (
                      <span className={styles.date}>
                        {formatAbsolute(item.createdAt)}
                      </span>
                    )}
                  </div>
                  {(onEditFeedback || onDeleteFeedback) && (
                    <div className={styles.itemActions}>
                      {onEditFeedback && (
                        <IconButton
                          variant="ghost"
                          size="sm"
                          label="Edit feedback"
                          onClick={() => onEditFeedback(item)}
                        >
                          <Pencil aria-hidden="true" />
                        </IconButton>
                      )}
                      {onDeleteFeedback && (
                        <IconButton
                          variant="ghost"
                          size="sm"
                          label="Delete feedback"
                          onClick={() => onDeleteFeedback(item)}
                        >
                          <Trash2 aria-hidden="true" />
                        </IconButton>
                      )}
                    </div>
                  )}
                </div>
                <p className={styles.content}>{item.content}</p>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
