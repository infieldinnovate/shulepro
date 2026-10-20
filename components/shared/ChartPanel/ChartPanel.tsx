"use client";

import type { ReactNode } from "react";
import { Info } from "lucide-react";
import clsx from "clsx";
import { Card } from "../../ui/Card";
import { Spinner } from "../../ui/Spinner";
import { EmptyState } from "../../ui/EmptyState";
import { Alert } from "../../ui/Alert";
import styles from "./ChartPanel.module.scss";

export interface ChartPanelProps {
  title: string;
  description?: string;
  summary?: string;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  definition?: ReactNode;
  actions?: ReactNode;
  height?: string;
  className?: string;
  children?: ReactNode;
}

export function ChartPanel({
  title,
  description,
  summary,
  loading = false,
  error,
  empty = false,
  definition,
  actions,
  height = "18rem",
  className,
  children,
}: ChartPanelProps) {
  const content = (() => {
    if (loading) {
      return (
        <div className={styles.loadingBody}>
          <Spinner size="md" label={`Loading ${title}`} />
        </div>
      );
    }
    if (error) {
      return (
        <Alert variant="error" title="Chart unavailable" description={error} />
      );
    }
    if (empty) {
      return (
        <EmptyState
          icon={<Info aria-hidden="true" />}
          title="No chart data"
          description={`There is no data available for ${title.toLowerCase()} yet.`}
        />
      );
    }
    return (
      <div
        className={styles.chartArea}
        style={{ blockSize: height }}
        role="img"
        aria-label={summary ?? title}
      >
        {children}
      </div>
    );
  })();

  return (
    <Card className={clsx(styles.card, className)} padded>
      <Card.Header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.titleRow}>
            <h4 className={styles.title}>{title}</h4>
            {definition && (
              <span className={styles.definition}>{definition}</span>
            )}
          </div>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </Card.Header>
      <Card.Body className={styles.body}>{content}</Card.Body>
    </Card>
  );
}
