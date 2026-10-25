import type { KeyboardEvent, ReactNode } from "react";
import { Briefcase, BookOpen, Compass } from "lucide-react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import type { CareerCluster } from "@/components/features/careers/types";
import styles from "./CareerClusterCard.module.scss";

export interface CareerClusterCardProps {
  cluster: CareerCluster | null;
  /** When provided, clicking the card calls this handler. */
  onSelect?: (cluster: CareerCluster) => void;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  disabled?: boolean;
  /** Optional content rendered in the footer (e.g. a drill-down link). */
  footer?: ReactNode;
  className?: string;
}

function handleKeyDown(
  event: KeyboardEvent<HTMLDivElement>,
  handler?: (cluster: CareerCluster) => void,
  cluster?: CareerCluster | null,
) {
  if (!handler || !cluster) return;
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    handler(cluster);
  }
}

export function CareerClusterCard({
  cluster,
  onSelect,
  loading = false,
  error,
  empty = false,
  disabled = false,
  footer,
  className,
}: CareerClusterCardProps) {
  if (loading) {
    return (
      <Card className={clsx(styles.card, styles.loadingCard, className)} padded>
        <div className={styles.loadingBody}>
          <Spinner size="md" label="Loading career cluster" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <Alert
          variant="error"
          title="Unable to load career cluster"
          description={error}
        />
      </Card>
    );
  }

  if (empty || !cluster) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <EmptyState
          icon={<Compass aria-hidden="true" />}
          title="No career cluster"
          description="There is no career cluster to display yet."
        />
      </Card>
    );
  }

  const clickable = typeof onSelect === "function" && !disabled;

  return (
    <Card
      className={clsx(
        styles.card,
        clickable && styles.interactive,
        disabled && styles.disabled,
        className,
      )}
      padded
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? () => onSelect?.(cluster) : undefined}
      onKeyDown={(e) => handleKeyDown(e, onSelect, cluster)}
      aria-label={clickable ? `View cluster: ${cluster.label}` : undefined}
    >
      <Card.Header className={styles.header}>
        <div className={styles.titleRow}>
          <h4 className={styles.title}>{cluster.label}</h4>
          {cluster.fitConfidenceLabel && (
            <Badge variant="info" size="sm">
              {cluster.fitConfidenceLabel}
            </Badge>
          )}
        </div>
        {cluster.description && (
          <p className={styles.description}>{cluster.description}</p>
        )}
      </Card.Header>

      <Card.Body className={styles.body}>
        {cluster.fitSummary && (
          <div className={styles.fitSummary}>
            <Compass aria-hidden="true" className={styles.fitIcon} />
            <p className={styles.fitText}>{cluster.fitSummary}</p>
          </div>
        )}

        {cluster.learningAreas.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionHead}>
              <BookOpen aria-hidden="true" className={styles.sectionIcon} />
              <h5 className={styles.sectionTitle}>Related learning areas</h5>
            </div>
            <div className={styles.tagRow}>
              {cluster.learningAreas.map((la) => (
                <Badge key={la.ref} variant="neutral" size="sm">
                  {la.label}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {cluster.interests.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionHead}>
              <Compass aria-hidden="true" className={styles.sectionIcon} />
              <h5 className={styles.sectionTitle}>Related interests</h5>
            </div>
            <div className={styles.tagRow}>
              {cluster.interests.map((interest) => (
                <Badge key={interest.dimensionKey} variant="info" size="sm">
                  {interest.label}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {cluster.occupations.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionHead}>
              <Briefcase aria-hidden="true" className={styles.sectionIcon} />
              <h5 className={styles.sectionTitle}>Sample occupations</h5>
            </div>
            <ul className={styles.occupationList}>
              {cluster.occupations.map((occ) => (
                <li key={occ.id} className={styles.occupationItem}>
                  <span className={styles.occupationLabel}>{occ.label}</span>
                  {occ.description && (
                    <span className={styles.occupationDescription}>
                      {occ.description}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card.Body>

      {footer && <Card.Footer className={styles.footer}>{footer}</Card.Footer>}
    </Card>
  );
}
