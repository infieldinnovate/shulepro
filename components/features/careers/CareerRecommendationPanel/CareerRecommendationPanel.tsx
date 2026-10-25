import type { ReactNode } from "react";
import { Lightbulb, TriangleAlert, Info } from "lucide-react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { DrillDownLink } from "@/components/shared/DrillDownLink";
import type { DrillDownContext } from "@/components/shared/DrillDownLink";
import type {
  CareerRecommendation,
  CareerRecommendationInputGap,
} from "@/components/features/careers/types";
import styles from "./CareerRecommendationPanel.module.scss";

export interface CareerRecommendationPanelProps {
  /** Configurable recommendation entries (caller-supplied). */
  recommendations: CareerRecommendation[];
  /** Disclosed gaps in the inputs used to generate recommendations. */
  inputGaps?: CareerRecommendationInputGap[];
  /** Called when a recommendation's drill-down is activated. */
  onDrillDown?: (context: DrillDownContext) => void;
  /** Optional title for the panel. */
  title?: string;
  /** Optional description shown under the title. */
  description?: string;
  /** Optional disclaimer shown above the recommendations. */
  disclaimer?: string;
  loading?: boolean;
  error?: string;
  /** Force-empty state regardless of recommendations. */
  empty?: boolean;
  /** Optional content rendered below the panel. */
  children?: ReactNode;
  className?: string;
}

export function CareerRecommendationPanel({
  recommendations,
  inputGaps,
  onDrillDown,
  title = "Career recommendations",
  description,
  disclaimer,
  loading = false,
  error,
  empty = false,
  children,
  className,
}: CareerRecommendationPanelProps) {
  if (loading) {
    return (
      <Card
        className={clsx(styles.card, styles.loadingCard, className)}
        padded
      >
        <div className={styles.loadingBody}>
          <Spinner size="md" label="Loading recommendations" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <Alert
          variant="error"
          title="Unable to load recommendations"
          description={error}
        />
      </Card>
    );
  }

  const isEmpty = empty || recommendations.length === 0;

  if (isEmpty && (!inputGaps || inputGaps.length === 0)) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <EmptyState
          icon={<Lightbulb aria-hidden="true" />}
          title="No recommendations"
          description="Career recommendations will appear here once enough interest, strengths, and assessment inputs are available."
        />
      </Card>
    );
  }

  return (
    <Card className={clsx(styles.card, className)} padded>
      <Card.Header className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {description && (
          <p className={styles.description}>{description}</p>
        )}
      </Card.Header>

      <Card.Body className={styles.body}>
        {disclaimer && (
          <div className={styles.disclaimer}>
            <Info aria-hidden="true" className={styles.disclaimerIcon} />
            <p className={styles.disclaimerText}>{disclaimer}</p>
          </div>
        )}

        {inputGaps && inputGaps.length > 0 && (
          <div className={styles.gapsSection} aria-label="Input gaps">
            <div className={styles.gapsHead}>
              <TriangleAlert aria-hidden="true" className={styles.gapsIcon} />
              <h4 className={styles.gapsTitle}>
                Incomplete inputs
              </h4>
            </div>
            <p className={styles.gapsIntro}>
              These recommendations are based on incomplete information.
              Addressing the gaps below may change the suggestions.
            </p>
            <ul className={styles.gapsList}>
              {inputGaps.map((gap) => (
                <li key={gap.id} className={styles.gapItem}>
                  <span className={styles.gapLabel}>{gap.label}</span>
                  {gap.explanation && (
                    <span className={styles.gapExplanation}>
                      {gap.explanation}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {isEmpty ? (
          <EmptyState
            icon={<Lightbulb aria-hidden="true" />}
            title="No recommendations yet"
            description="Complete more career interest and strengths inputs to see suggestions here."
          />
        ) : (
          <ul className={styles.recommendationList} aria-label="Recommendations">
            {recommendations.map((rec) => (
              <li key={rec.id} className={styles.recommendationItem}>
                <div className={styles.recommendationHead}>
                  <div className={styles.recommendationTitleRow}>
                    <h4 className={styles.recommendationTitle}>{rec.title}</h4>
                    {rec.confidenceLabel && (
                      <Badge variant="info" size="sm">
                        {rec.confidenceLabel}
                      </Badge>
                    )}
                  </div>
                  {rec.description && (
                    <p className={styles.recommendationDescription}>
                      {rec.description}
                    </p>
                  )}
                </div>

                <div className={styles.rationaleSection}>
                  <h5 className={styles.rationaleLabel}>Why this appears</h5>
                  <p className={styles.rationaleText}>{rec.rationale}</p>
                </div>

                {rec.limitations && rec.limitations.length > 0 && (
                  <div className={styles.limitationsSection}>
                    <h5 className={styles.limitationsLabel}>Limitations</h5>
                    <ul className={styles.limitationsList}>
                      {rec.limitations.map((limitation, index) => (
                        <li key={index} className={styles.limitationItem}>
                          {limitation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {rec.targetLabel && (
                  <div className={styles.drillDownRow}>
                    <DrillDownLink
                      variant="inline"
                      context={{
                        targetRef: rec.targetRef,
                        targetLabel: rec.targetLabel,
                        recommendationId: rec.id,
                      }}
                      onDrillDown={onDrillDown}
                    >
                      {rec.targetLabel}
                    </DrillDownLink>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {children}
      </Card.Body>
    </Card>
  );
}
