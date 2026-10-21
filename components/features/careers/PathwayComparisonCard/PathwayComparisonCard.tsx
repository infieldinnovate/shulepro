import type { ReactNode } from "react";
import { GitCompare } from "lucide-react";
import clsx from "clsx";
import { Card } from "../../../ui/Card";
import { Badge } from "../../../ui/Badge";
import { Spinner } from "../../../ui/Spinner";
import { Alert } from "../../../ui/Alert";
import { EmptyState } from "../../../ui/EmptyState";
import type {
  PathwayComparisonCriterion,
  PathwayComparisonEntry,
} from "../types";
import styles from "./PathwayComparisonCard.module.scss";

export interface PathwayComparisonCardProps {
  /** Configurable criteria used for comparison. */
  criteria: PathwayComparisonCriterion[];
  /** Pathway entries with values per criterion. */
  pathways: PathwayComparisonEntry[];
  /** Optional title for the comparison card. */
  title?: string;
  /** Optional description shown under the title. */
  description?: string;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  /** Optional content rendered below the comparison. */
  children?: ReactNode;
  className?: string;
}

function findValue(
  entry: PathwayComparisonEntry,
  criterionKey: string,
): string | undefined {
  return entry.values.find((v) => v.criterionKey === criterionKey)?.value;
}

export function PathwayComparisonCard({
  criteria,
  pathways,
  title = "Pathway comparison",
  description,
  loading = false,
  error,
  empty = false,
  children,
  className,
}: PathwayComparisonCardProps) {
  if (loading) {
    return (
      <Card className={clsx(styles.card, styles.loadingCard, className)} padded>
        <div className={styles.loadingBody}>
          <Spinner size="md" label="Loading pathway comparison" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <Alert
          variant="error"
          title="Unable to load pathway comparison"
          description={error}
        />
      </Card>
    );
  }

  const isEmpty = empty || criteria.length === 0 || pathways.length === 0;

  if (isEmpty) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <EmptyState
          icon={<GitCompare aria-hidden="true" />}
          title="No comparison data"
          description="Add at least one criterion and one pathway to see a comparison."
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
        <div className={styles.tableWrap} role="region" aria-label={title} tabIndex={0}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col" className={styles.criterionCol}>
                  Criterion
                </th>
                {pathways.map((p) => (
                  <th key={p.pathwayKey} scope="col" className={styles.pathwayCol}>
                    <span className={styles.pathwayTitle}>{p.label}</span>
                    {p.description && (
                      <span className={styles.pathwayDescription}>
                        {p.description}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {criteria.map((criterion) => (
                <tr key={criterion.key} className={styles.row}>
                  <th scope="row" className={styles.criterionCol}>
                    <span className={styles.criterionLabel}>{criterion.label}</span>
                    {criterion.description && (
                      <span className={styles.criterionDescription}>
                        {criterion.description}
                      </span>
                    )}
                  </th>
                  {pathways.map((pathway) => {
                    const value = findValue(pathway, criterion.key);
                    return (
                      <td key={pathway.pathwayKey} className={styles.pathwayCol}>
                        {value ? (
                          <span className={styles.cellValue}>{value}</span>
                        ) : (
                          <Badge variant="neutral" size="sm">
                            Not provided
                          </Badge>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {children}
      </Card.Body>
    </Card>
  );
}
