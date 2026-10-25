import type { ReactNode } from "react";
import { Info, ChevronRight, Clock, ArrowRight } from "lucide-react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { formatRelativeTime, formatAbsolute } from "@/lib/formatTime";
import styles from "./OverdueItemsList.module.scss";

export interface OverdueOwner {
  id: string;
  name: string;
  avatarSrc?: string;
  initials?: string;
}

export interface OverdueItem {
  id: string;
  title: string;
  description?: string;
  /** Timestamp the item was due (epoch ms or ISO string). */
  dueDate: number | string;
  owner?: OverdueOwner;
  /** Label for the action to take, e.g. "Follow up" or "Review". */
  actionLabel?: string;
  onAction?: () => void;
  onDrillDown?: () => void;
}

export interface OverdueItemsListProps {
  title: string;
  items: OverdueItem[];
  loading?: boolean;
  error?: string;
  empty?: boolean;
  emptyDescription?: string;
  summary?: string;
  className?: string;
  children?: ReactNode;
}

export function OverdueItemsList({
  title,
  items,
  loading = false,
  error,
  empty = false,
  emptyDescription,
  summary,
  className,
  children,
}: OverdueItemsListProps) {
  const body = (() => {
    if (loading) {
      return (
        <div className={styles.loadingBody}>
          <Spinner size="md" label={`Loading ${title}`} />
        </div>
      );
    }
    if (error) {
      return <Alert variant="error" title="Data unavailable" description={error} />;
    }
    if (empty || items.length === 0) {
      return (
        <EmptyState
          icon={<Info aria-hidden="true" />}
          title="Nothing overdue"
          description={emptyDescription ?? `There are no overdue items for ${title.toLowerCase()}.`}
        />
      );
    }
    return (
      <ul className={styles.list} aria-label={summary ?? title}>
        {items.map((item) => {
          const relativeAge = formatRelativeTime(item.dueDate);
          const absoluteDate = formatAbsolute(item.dueDate);
          const owner = item.owner;
          const drillable = Boolean(item.onDrillDown);
          const actionable = Boolean(item.onAction);

          return (
            <li key={item.id} className={styles.item}>
              <div className={styles.row}>
                <span className={styles.ageCol}>
                  <Clock aria-hidden="true" size={14} className={styles.clockIcon} />
                  <time
                    className={styles.ageLabel}
                    dateTime={item.dueDate ? new Date(item.dueDate).toISOString() : undefined}
                    title={absoluteDate || undefined}
                  >
                    {relativeAge || "Overdue"}
                  </time>
                </span>
                <div
                  className={clsx(styles.detailCol, drillable && styles.drillable)}
                  role={drillable ? "button" : undefined}
                  tabIndex={drillable ? 0 : undefined}
                  aria-label={drillable ? `View details: ${item.title}` : undefined}
                  onClick={drillable ? item.onDrillDown : undefined}
                  onKeyDown={
                    drillable
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            item.onDrillDown?.();
                          }
                        }
                      : undefined
                  }
                >
                  <span className={styles.itemTitle}>{item.title}</span>
                  {item.description && (
                    <span className={styles.itemDescription}>{item.description}</span>
                  )}
                  {owner && (
                    <span className={styles.ownerRow}>
                      <Avatar
                        src={owner.avatarSrc}
                        name={owner.initials ?? owner.name}
                        alt={owner.name}
                        size="sm"
                      />
                      <span className={styles.ownerName}>{owner.name}</span>
                    </span>
                  )}
                </div>
                {actionable && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className={styles.actionButton}
                    onClick={item.onAction}
                    rightIcon={<ArrowRight aria-hidden="true" size={14} />}
                  >
                    <span>{item.actionLabel ?? "Take action"}</span>
                  </Button>
                )}
                {drillable && !actionable && (
                  <span className={styles.drillIcon}>
                    <ChevronRight aria-hidden="true" size={16} />
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    );
  })();

  return (
    <Card className={clsx(styles.card, className)} padded>
      <Card.Header className={styles.header}>
        <h4 className={styles.title}>{title}</h4>
        {!loading && !error && items.length > 0 && (
          <Badge variant="error" size="sm" dot>
            {items.length} overdue
          </Badge>
        )}
      </Card.Header>
      <Card.Body className={styles.body}>
        {body}
        {children}
      </Card.Body>
    </Card>
  );
}
