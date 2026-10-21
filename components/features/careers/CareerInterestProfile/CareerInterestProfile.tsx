import type { ReactNode } from "react";
import { Heart } from "lucide-react";
import clsx from "clsx";
import { Card } from "../../../ui/Card";
import { Badge } from "../../../ui/Badge";
import { Progress } from "../../../ui/Progress";
import { Spinner } from "../../../ui/Spinner";
import { Alert } from "../../../ui/Alert";
import { EmptyState } from "../../../ui/EmptyState";
import type {
  CareerInterestDimension,
  CareerInterestResponse,
  CareerInterestScaleOption,
} from "../types";
import styles from "./CareerInterestProfile.module.scss";

export interface CareerInterestProfileProps {
  /** Configurable interest dimensions assessed in this profile. */
  dimensions: CareerInterestDimension[];
  /** Recorded responses keyed by dimension key. */
  responses: Record<string, CareerInterestResponse | undefined>;
  /** Optional free-text summary of the interest profile. */
  summary?: string;
  /** Optional title for the profile card. */
  title?: string;
  /** Optional description shown under the title. */
  description?: string;
  loading?: boolean;
  error?: string;
  /** Force-empty state regardless of dimensions. */
  empty?: boolean;
  /** Optional content rendered below the profile (e.g. notes). */
  children?: ReactNode;
  className?: string;
}

function findScaleOption(
  dimension: CareerInterestDimension,
  value: string | undefined,
): CareerInterestScaleOption | undefined {
  if (!value) return undefined;
  return dimension.scale.find((opt) => opt.value === value);
}

function toPercent(
  option: CareerInterestScaleOption | undefined,
  dimension: CareerInterestDimension,
): number | null {
  if (!option || option.numericValue == null) return null;
  const numericValues = dimension.scale
    .map((o) => o.numericValue)
    .filter((v): v is number => v != null);
  if (numericValues.length === 0) return null;
  const min = Math.min(...numericValues);
  const max = Math.max(...numericValues);
  if (max === min) return option.numericValue >= max ? 100 : 0;
  return Math.round(
    ((option.numericValue - min) / (max - min)) * 100,
  );
}

export function CareerInterestProfile({
  dimensions,
  responses,
  summary,
  title = "Career interest profile",
  description,
  loading = false,
  error,
  empty = false,
  children,
  className,
}: CareerInterestProfileProps) {
  if (loading) {
    return (
      <Card className={clsx(styles.card, styles.loadingCard, className)} padded>
        <div className={styles.loadingBody}>
          <Spinner size="md" label="Loading interest profile" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <Alert
          variant="error"
          title="Unable to load interest profile"
          description={error}
        />
      </Card>
    );
  }

  const isEmpty = empty || dimensions.length === 0;

  if (isEmpty) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <EmptyState
          icon={<Heart aria-hidden="true" />}
          title="No interest profile"
          description="Career interest dimensions and responses will appear here once recorded."
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
        {summary && <p className={styles.summary}>{summary}</p>}

        <ul className={styles.dimensionList} aria-label="Interest dimensions">
          {dimensions.map((dimension) => {
            const response = responses[dimension.key];
            const option = findScaleOption(dimension, response?.value);
            const percent = toPercent(option, dimension);
            const answered = Boolean(option);

            return (
              <li key={dimension.key} className={styles.dimensionItem}>
                <div className={styles.dimensionHead}>
                  <span className={styles.dimensionLabel}>
                    {dimension.label}
                  </span>
                  {answered ? (
                    <Badge variant="info" size="sm">
                      {option?.shortLabel ?? option?.label}
                    </Badge>
                  ) : (
                    <Badge variant="neutral" size="sm">
                      Not recorded
                    </Badge>
                  )}
                </div>
                {dimension.description && (
                  <p className={styles.dimensionDescription}>
                    {dimension.description}
                  </p>
                )}
                {answered && percent != null && (
                  <Progress
                    value={percent}
                    label={`Interest level for ${dimension.label}`}
                    valueText={`${percent} percent`}
                    size="sm"
                    className={styles.progress}
                  />
                )}
                {response?.notes && (
                  <p className={styles.notes}>{response.notes}</p>
                )}
              </li>
            );
          })}
        </ul>

        {children}
      </Card.Body>
    </Card>
  );
}
