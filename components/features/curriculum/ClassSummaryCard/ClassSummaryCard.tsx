import type { ReactNode } from "react";
import { School } from "lucide-react";
import clsx from "clsx";
import { RecordSummaryCard } from "../../../shared/RecordSummaryCard";
import { Spinner } from "../../../ui/Spinner";
import { Alert } from "../../../ui/Alert";
import { EmptyState } from "../../../ui/EmptyState";
import { Card } from "../../../ui/Card";
import { Avatar } from "../../../ui/Avatar";
import type { Class, ClassSummaryStat, Grade } from "../types";
import styles from "./ClassSummaryCard.module.scss";

export interface ClassSummaryCardProps {
  class?: Class | null;
  grade?: Grade | null;
  /** Pre-computed summary stats (class size, attendance rate, etc.). */
  stats?: ClassSummaryStat[];
  /** Action buttons or menu rendered inline-end. */
  actions?: ReactNode;
  /** Enrolment/status badge node — caller provides this slot. */
  status?: ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  className?: string;
}

function teacherInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function ClassSummaryCard({
  class: classData,
  grade,
  stats,
  actions,
  status,
  onClick,
  ariaLabel,
  loading = false,
  error,
  empty = false,
  className,
}: ClassSummaryCardProps) {
  if (loading) {
    return (
      <Card padded className={clsx(styles.loadingCard, className)}>
        <Spinner size="md" label="Loading class" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card padded className={className}>
        <Alert variant="error" title="Class unavailable" description={error} />
      </Card>
    );
  }

  if (empty || !classData) {
    return (
      <Card padded className={clsx(styles.emptyCard, className)}>
        <EmptyState
          icon={<School aria-hidden="true" />}
          title="No class selected"
          description="Select a class to view its summary."
        />
      </Card>
    );
  }

  const teachers = classData.teachers ?? [];
  const subtitle = grade?.label ?? undefined;

  const meta: ReactNode[] = [];

  // Teacher info
  if (teachers.length > 0) {
    const first = teachers[0];
    const teacherText = teachers.length > 1
      ? `${first.name} +${teachers.length - 1} more`
      : first.name;
    meta.push(
      <span className={styles.metaItem}>
        <span className={styles.metaLabel}>Teacher</span>
        <span className={styles.metaValue}>{teacherText}</span>
      </span>,
    );
  }

  // Room
  if (classData.room) {
    meta.push(
      <span className={styles.metaItem}>
        <span className={styles.metaLabel}>Room</span>
        <span className={styles.metaValue}>{classData.room}</span>
      </span>,
    );
  }

  // Pre-computed stats
  if (stats) {
    for (const stat of stats) {
      const valueText =
        stat.value == null
          ? "—"
          : `${stat.value}${stat.unit ? ` ${stat.unit}` : ""}`;
      meta.push(
        <span className={styles.metaItem}>
          {stat.icon && <span className={styles.statIcon}>{stat.icon}</span>}
          <span className={styles.metaLabel}>{stat.label}</span>
          <span className={styles.metaValue}>{valueText}</span>
        </span>,
      );
    }
  }

  // Avatar: first teacher's avatar, or a class icon fallback
  const avatar = teachers.length > 0 ? (
    <Avatar
      src={teachers[0].avatarSrc}
      name={teachers[0].initials ?? teacherInitials(teachers[0].name)}
      alt={teachers[0].name}
      size="md"
    />
  ) : (
    <span className={styles.classAvatar}>
      <School aria-hidden="true" />
    </span>
  );

  return (
    <RecordSummaryCard
      avatar={avatar}
      title={classData.label}
      subtitle={subtitle}
      meta={meta.length > 0 ? meta : undefined}
      status={status}
      actions={actions}
      onClick={onClick}
      ariaLabel={ariaLabel ?? `View ${classData.label}`}
      className={className}
    />
  );
}
