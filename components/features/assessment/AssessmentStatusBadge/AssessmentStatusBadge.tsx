import { CircleSlash, Clock, Send, SquareCheck as CheckSquare, Globe, File as FileEdit } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { StatusBadgeMap } from "@/components/shared/StatusBadge";
import type { AssessmentStatus } from "@/components/features/assessment/types";
import styles from "./AssessmentStatusBadge.module.scss";

export type AssessmentStatusBadgeMap = StatusBadgeMap<AssessmentStatus>;

export const DEFAULT_ASSESSMENT_STATUS_MAP: AssessmentStatusBadgeMap = {
  "not-assessed": {
    variant: "neutral",
    label: "Not assessed",
    icon: <CircleSlash aria-hidden="true" />,
    dot: true,
  },
  "in-progress": {
    variant: "info",
    label: "In progress",
    icon: <Clock aria-hidden="true" />,
    dot: true,
  },
  submitted: {
    variant: "primary",
    label: "Submitted",
    icon: <Send aria-hidden="true" />,
    dot: true,
  },
  moderated: {
    variant: "warning",
    label: "Moderated",
    icon: <CheckSquare aria-hidden="true" />,
    dot: true,
  },
  published: {
    variant: "success",
    label: "Published",
    icon: <Globe aria-hidden="true" />,
    dot: true,
  },
  draft: {
    variant: "neutral",
    label: "Draft",
    icon: <FileEdit aria-hidden="true" />,
  },
};

export interface AssessmentStatusBadgeProps {
  status: AssessmentStatus;
  /** Override the default status map. */
  statusMap?: AssessmentStatusBadgeMap;
  size?: "sm" | "md";
  className?: string;
}

export function AssessmentStatusBadge({
  status,
  statusMap = DEFAULT_ASSESSMENT_STATUS_MAP,
  size = "md",
  className,
}: AssessmentStatusBadgeProps) {
  const mapping = statusMap[status];
  if (!mapping) {
    return <span className={styles.fallback}>{status}</span>;
  }

  return (
    <StatusBadge
      status={status}
      statusMap={statusMap}
      size={size}
      className={className}
    />
  );
}
