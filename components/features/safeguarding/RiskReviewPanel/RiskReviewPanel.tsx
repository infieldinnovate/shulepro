import { format } from "date-fns";
import { ClipboardCheck, Plus, CalendarClock } from "lucide-react";
import clsx from "clsx";
import { Card } from "../../../ui/Card";
import { Badge } from "../../../ui/Badge";
import { Button } from "../../../ui/Button";
import { Spinner } from "../../../ui/Spinner";
import { Alert } from "../../../ui/Alert";
import { EmptyState } from "../../../ui/EmptyState";
import { StatusBadge } from "../../../shared/StatusBadge";
import type { StatusBadgeMap } from "../../../shared/StatusBadge";
import type { RiskReview, RiskLevel } from "../types";
import styles from "./RiskReviewPanel.module.scss";

export type RiskLevelBadgeMap = StatusBadgeMap<RiskLevel>;

export interface RiskReviewPanelProps {
  reviews: RiskReview[];
  riskLevelMap: RiskLevelBadgeMap;
  onAddReview?: () => void;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  className?: string;
}

function toDate(d: Date | string): Date {
  return typeof d === "string" ? new Date(d) : d;
}

export function RiskReviewPanel({
  reviews,
  riskLevelMap,
  onAddReview,
  loading = false,
  error,
  empty = false,
  className,
}: RiskReviewPanelProps) {
  if (loading) {
    return (
      <Card className={clsx(styles.card, styles.loadingCard, className)} padded>
        <div className={styles.loadingBody}>
          <Spinner size="md" label="Loading risk reviews" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <Alert
          variant="error"
          title="Unable to load risk reviews"
          description={error}
        />
      </Card>
    );
  }

  const isEmpty = empty || reviews.length === 0;

  return (
    <Card className={clsx(styles.card, className)} padded>
      <Card.Header className={styles.header}>
        <div className={styles.titleRow}>
          <div className={styles.titleGroup}>
            <ClipboardCheck aria-hidden="true" className={styles.titleIcon} />
            <h4 className={styles.title}>Risk reviews</h4>
          </div>
          {onAddReview && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<Plus aria-hidden="true" />}
              onClick={onAddReview}
            >
              Add review
            </Button>
          )}
        </div>
      </Card.Header>

      <Card.Body className={styles.body}>
        {isEmpty ? (
          <EmptyState
            icon={<ClipboardCheck aria-hidden="true" />}
            title="No risk reviews"
            description="Risk reviews will appear here once they are recorded."
          />
        ) : (
          <ol className={styles.reviewList}>
            {reviews.map((review) => (
              <li key={review.id} className={styles.reviewItem}>
                <div className={styles.reviewHeader}>
                  <StatusBadge
                    status={review.riskLevel}
                    statusMap={riskLevelMap}
                    size="sm"
                  />
                  <span className={styles.reviewDate}>
                    {format(toDate(review.reviewDate), "MMM d, yyyy")}
                  </span>
                </div>
                {review.reviewerName && (
                  <p className={styles.reviewer}>
                    Reviewed by {review.reviewerName}
                  </p>
                )}
                {review.factors.length > 0 && (
                  <div className={styles.factors}>
                    {review.factors.map((factor, index) => (
                      <Badge key={index} variant="neutral" size="sm">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                )}
                {review.rationale && (
                  <p className={styles.rationale}>{review.rationale}</p>
                )}
                {review.nextReviewDate && (
                  <p className={styles.nextReview}>
                    <CalendarClock
                      aria-hidden="true"
                      className={styles.nextReviewIcon}
                    />
                    Next review:{" "}
                    {format(toDate(review.nextReviewDate), "MMM d, yyyy")}
                  </p>
                )}
              </li>
            ))}
          </ol>
        )}
      </Card.Body>
    </Card>
  );
}
