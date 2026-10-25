import type { ReactNode } from "react";
import { GitCompare } from "lucide-react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table } from "@/components/ui/Table";
import type {
  PathwayComparisonCriterion,
  PathwayComparisonEntry,
} from "@/components/features/careers/types";
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
        <Table
          className={styles.tableWrap}
          role="region"
          aria-label={title}
          tabIndex={0}
        >
          <Table.Header>
            <Table.Row>
              <Table.Head className={styles.criterionCol}>
                Criterion
              </Table.Head>
              {pathways.map((p) => (
                <Table.Head key={p.pathwayKey} className={styles.pathwayCol}>
                  <span className={styles.pathwayTitle}>{p.label}</span>
                  {p.description && (
                    <span className={styles.pathwayDescription}>
                      {p.description}
                    </span>
                  )}
                </Table.Head>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {criteria.map((criterion) => (
              <Table.Row key={criterion.key} className={styles.row}>
                <Table.Head scope="row" className={styles.criterionCol}>
                  <span className={styles.criterionLabel}>{criterion.label}</span>
                  {criterion.description && (
                    <span className={styles.criterionDescription}>
                      {criterion.description}
                    </span>
                  )}
                </Table.Head>
                {pathways.map((pathway) => {
                  const value = findValue(pathway, criterion.key);
                  return (
                    <Table.Cell key={pathway.pathwayKey} className={styles.pathwayCol}>
                      {value ? (
                        <span className={styles.cellValue}>{value}</span>
                      ) : (
                        <Badge variant="neutral" size="sm">
                          Not provided
                        </Badge>
                      )}
                    </Table.Cell>
                  );
                })}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>

        {children}
      </Card.Body>
    </Card>
  );
}
