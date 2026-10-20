import { GraduationCap, ArrowLeftRight, CircleCheck as CheckCircle2, LogOut, Ban } from "lucide-react";
import clsx from "clsx";
import { StatusBadge } from "../../../shared/StatusBadge";
import type { StatusBadgeMap } from "../../../shared/StatusBadge";
import type { EnrolmentStatus } from "../types";
import styles from "./EnrolmentStatusBadge.module.scss";

export type EnrolmentStatusBadgeMap = StatusBadgeMap<EnrolmentStatus>;

export const DEFAULT_ENROLMENT_STATUS_MAP: EnrolmentStatusBadgeMap = {
  active: {
    variant: "success",
    label: "Active",
    icon: <CheckCircle2 aria-hidden="true" />,
    dot: true,
  },
  transferred: {
    variant: "info",
    label: "Transferred",
    icon: <ArrowLeftRight aria-hidden="true" />,
  },
  graduated: {
    variant: "primary",
    label: "Graduated",
    icon: <GraduationCap aria-hidden="true" />,
  },
  withdrawn: {
    variant: "warning",
    label: "Withdrawn",
    icon: <LogOut aria-hidden="true" />,
  },
  suspended: {
    variant: "error",
    label: "Suspended",
    icon: <Ban aria-hidden="true" />,
  },
};

export interface EnrolmentStatusBadgeProps {
  status: EnrolmentStatus;
  /** Override the default enrolment status map. */
  statusMap?: EnrolmentStatusBadgeMap;
  size?: "sm" | "md";
  className?: string;
}

export function EnrolmentStatusBadge({
  status,
  statusMap = DEFAULT_ENROLMENT_STATUS_MAP,
  size = "md",
  className,
}: EnrolmentStatusBadgeProps) {
  const mapping = statusMap[status];
  if (!mapping) {
    return (
      <span className={clsx(styles.fallback, className)}>{status}</span>
    );
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
