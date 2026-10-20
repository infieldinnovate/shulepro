import type { ReactNode } from "react";
import { CircleCheck as CheckCircle2, TriangleAlert as AlertTriangle, Circle as XCircle, Info } from "lucide-react";
import clsx from "clsx";
import styles from "./DataAvailabilityNotice.module.scss";

export type DataAvailabilityStatus = "complete" | "partial" | "missing";

export interface DataAvailabilityNoticeProps {
  /** Coverage status of the data shown in the report. */
  status: DataAvailabilityStatus;
  /** Primary message describing the status. */
  message: ReactNode;
  /** Optional secondary detail shown beneath the message. */
  detail?: ReactNode;
  /** Override the title for the notice. Defaults derive from status. */
  title?: ReactNode;
  /** Render as a compact inline banner instead of a full block. */
  compact?: boolean;
  /** Optional call-to-action rendered on the right (e.g. "Refresh"). */
  action?: ReactNode;
  className?: string;
}

const STATUS_CONFIG: Record<
  DataAvailabilityStatus,
  { defaultTitle: string; icon: ReactNode; mod: string }
> = {
  complete: {
    defaultTitle: "Data complete",
    icon: <CheckCircle2 aria-hidden="true" />,
    mod: "complete",
  },
  partial: {
    defaultTitle: "Partial data",
    icon: <AlertTriangle aria-hidden="true" />,
    mod: "partial",
  },
  missing: {
    defaultTitle: "Data unavailable",
    icon: <XCircle aria-hidden="true" />,
    mod: "missing",
  },
};

export function DataAvailabilityNotice({
  status,
  message,
  detail,
  title,
  compact = false,
  action,
  className,
}: DataAvailabilityNoticeProps) {
  const config = STATUS_CONFIG[status];
  const resolvedTitle = title ?? config.defaultTitle;
  const role = status === "complete" ? "status" : "alert";

  return (
    <div
      className={clsx(
        styles.notice,
        styles[config.mod],
        compact && styles.compact,
        className,
      )}
      role={role}
    >
      <span className={styles.icon} aria-hidden="true">
        {config.icon}
      </span>
      <div className={styles.content}>
        <p className={styles.title}>
          {resolvedTitle}
          {status === "partial" && (
            <Info className={styles.titleHint} aria-hidden="true" />
          )}
        </p>
        <p className={styles.message}>{message}</p>
        {detail && <p className={styles.detail}>{detail}</p>}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
