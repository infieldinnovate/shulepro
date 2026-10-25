import type { ReactNode } from "react";
import {
  Info,
  ChevronRight,
  TriangleAlert as AlertTriangle,
  OctagonAlert as AlertOctagon,
  CircleAlert as AlertCircle,
} from "lucide-react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Alert } from "@/components/ui/Alert";
import { formatDate } from "@/lib/formatTime";
import styles from "./ActionRequiredList.module.scss";

export type ActionSeverity = "critical" | "high" | "medium" | "low";
export type ActionDeadlineStatus = "on-track" | "due-soon" | "overdue" | "none";

export interface ActionAssignee {
  id: string;
  name: string;
  avatarSrc?: string;
  initials?: string;
  roleLabel?: string;
}

export interface ActionItem {
  id: string;
  title: string;
  description?: string;
  severity: ActionSeverity;
  assignee?: ActionAssignee;
  dueDate?: number | string;
  deadlineStatus: ActionDeadlineStatus;
  onSelect?: () => void;
  onDrillDown?: () => void;
}

export interface ActionRequiredListProps {
  title: string;
  items: ActionItem[];
  loading?: boolean;
  error?: string;
  empty?: boolean;
  emptyDescription?: string;
  summary?: string;
  className?: string;
  children?: ReactNode;
}

const SEVERITY_CONFIG: Record<
  ActionSeverity,
  { variant: "error" | "warning" | "info" | "neutral"; icon: ReactNode; label: string; order: number }
> = {
  critical: {
    variant: "error",
    icon: <AlertOctagon aria-hidden="true" size={14} />,
    label: "Critical",
    order: 0,
  },
  high: {
    variant: "warning",
    icon: <AlertCircle aria-hidden="true" size={14} />,
    label: "High",
    order: 1,
  },
  medium: {
    variant: "info",
    icon: <AlertTriangle aria-hidden="true" size={14} />,
    label: "Medium",
    order: 2,
  },
  low: {
    variant: "neutral",
    icon: <AlertCircle aria-hidden="true" size={14} />,
    label: "Low",
    order: 3,
  },
};

const DEADLINE_CONFIG: Record<
  ActionDeadlineStatus,
  { variant: "success" | "warning" | "error" | "neutral"; label: string }
> = {
  "on-track": { variant: "success", label: "On track" },
  "due-soon": { variant: "warning", label: "Due soon" },
  overdue: { variant: "error", label: "Overdue" },
  none: { variant: "neutral", label: "No deadline" },
};

export function ActionRequiredList({
  title,
  items,
  loading = false,
  error,
  empty = false,
  emptyDescription,
  summary,
  className,
  children,
}: ActionRequiredListProps) {
  const sortedItems = [...items].sort((a, b) => {
    const sevOrder = SEVERITY_CONFIG[a.severity].order - SEVERITY_CONFIG[b.severity].order;
    if (sevOrder !== 0) return sevOrder;
    const dlOrder =
      DEADLINE_CONFIG[a.deadlineStatus].variant.localeCompare(
        DEADLINE_CONFIG[b.deadlineStatus].variant,
      );
    return dlOrder;
  });

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
          title="No actions required"
          description={emptyDescription ?? `There are no outstanding actions for ${title.toLowerCase()} right now.`}
        />
      );
    }
    return (
      <ul className={styles.list} aria-label={summary ?? title}>
        {sortedItems.map((item) => {
          const sev = SEVERITY_CONFIG[item.severity];
          const dl = DEADLINE_CONFIG[item.deadlineStatus];
          const interactive = Boolean(item.onSelect ?? item.onDrillDown);
          const handler = item.onSelect ?? item.onDrillDown;
          const dueLabel = item.dueDate ? formatDate(item.dueDate) : null;
          const assignee = item.assignee;

          return (
            <li key={item.id} className={styles.item}>
              <div
                className={clsx(styles.row, interactive && styles.interactive)}
                role={interactive ? "button" : undefined}
                tabIndex={interactive ? 0 : undefined}
                aria-label={
                  interactive
                    ? `Open action: ${item.title}${assignee ? `, assigned to ${assignee.name}` : ""}`
                    : undefined
                }
                onClick={interactive ? handler : undefined}
                onKeyDown={
                  interactive
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handler?.();
                        }
                      }
                    : undefined
                }
              >
                <span className={styles.severityCol}>
                  <Badge variant={sev.variant} size="sm" icon={sev.icon}>
                    {sev.label}
                  </Badge>
                </span>
                <div className={styles.detailCol}>
                  <span className={styles.itemTitle}>{item.title}</span>
                  {item.description && (
                    <span className={styles.itemDescription}>{item.description}</span>
                  )}
                  <div className={styles.metaRow}>
                    <Badge variant={dl.variant} size="sm" dot>
                      {dl.label}
                    </Badge>
                    {dueLabel && (
                      <time className={styles.dueDate} dateTime={item.dueDate ? new Date(item.dueDate).toISOString() : undefined}>
                        {dueLabel}
                      </time>
                    )}
                  </div>
                </div>
                <div className={styles.assigneeCol}>
                  {assignee && (
                    <span className={styles.assignee}>
                      <Avatar
                        src={assignee.avatarSrc}
                        name={assignee.initials ?? assignee.name}
                        alt={assignee.name}
                        size="sm"
                      />
                      <span className={styles.assigneeName}>{assignee.name}</span>
                    </span>
                  )}
                </div>
                {interactive && (
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
          <Badge variant="neutral" size="sm">
            {items.length}
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
