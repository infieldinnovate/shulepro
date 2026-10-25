import type { ReactNode } from "react";
import { ClipboardCheck, AlertCircle } from "lucide-react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import type { PathwayAllocation } from "@/components/features/careers/types";
import styles from "./FinalAllocationCard.module.scss";

export interface FinalAllocationCardProps {
  /** The final, human-approved allocation to display. */
  allocation: PathwayAllocation | null;
  /** Optional title override. */
  title?: string;
  loading?: boolean;
  error?: string;
  /** Optional content rendered below the allocation details. */
  children?: ReactNode;
  className?: string;
}

function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return String(date);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function FinalAllocationCard({
  allocation,
  title = "Final pathway allocation",
  loading = false,
  error,
  children,
  className,
}: FinalAllocationCardProps) {
  if (loading) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <div className={styles.loadingState}>
          <Spinner size="md" label="Loading final allocation" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <Alert
          variant="error"
          title="Unable to load final allocation"
          description={error}
        />
      </Card>
    );
  }

  if (!allocation) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <EmptyState
          icon={<ClipboardCheck aria-hidden="true" />}
          title="No allocation has been finalized"
          description="Once a pathway is approved by a reviewer, the final allocation will appear here."
        />
      </Card>
    );
  }

  return (
    <Card className={clsx(styles.card, className)} padded>
      <Card.Header className={styles.header}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>{title}</h3>
          <Badge variant="success" size="sm" dot>
            Approved
          </Badge>
        </div>
        <p className={styles.pathwayLabel}>{allocation.pathwayLabel}</p>
      </Card.Header>

      <Card.Body className={styles.body}>
        <div className={styles.rationaleBlock}>
          <h4 className={styles.sectionTitle}>Rationale</h4>
          <p className={styles.rationale}>{allocation.rationale}</p>
        </div>

        {allocation.limitations && allocation.limitations.length > 0 && (
          <div className={styles.limitationsBlock}>
            <div className={styles.limitationsHeader}>
              <AlertCircle
                aria-hidden="true"
                className={styles.limitationsIcon}
              />
              <h4 className={styles.sectionTitle}>Limitations</h4>
            </div>
            <ul className={styles.limitationsList}>
              {allocation.limitations.map((limitation, index) => (
                <li key={index} className={styles.limitationItem}>
                  {limitation}
                </li>
              ))}
            </ul>
          </div>
        )}

        {allocation.notes && (
          <div className={styles.notesBlock}>
            <h4 className={styles.sectionTitle}>Notes</h4>
            <p className={styles.notes}>{allocation.notes}</p>
          </div>
        )}

        <div className={styles.approverRow}>
          <Avatar
            name={allocation.approverInitials ?? allocation.approverName}
            src={allocation.approverAvatarSrc}
            alt={allocation.approverName}
            size="sm"
          />
          <div className={styles.approverInfo}>
            <span className={styles.approverName}>{allocation.approverName}</span>
            <span className={styles.approverDate}>
              Approved on {formatDate(allocation.approvedAt)}
            </span>
          </div>
        </div>

        {children}
      </Card.Body>
    </Card>
  );
}
