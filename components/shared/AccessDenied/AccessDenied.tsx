import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import clsx from "clsx";
import styles from "./AccessDenied.module.scss";

export interface AccessDeniedProps {
  title?: string;
  message?: string;
  requiredPermission?: string;
  showContact?: boolean;
  contactText?: string;
  icon?: ReactNode;
  className?: string;
}

// AccessDenied is a PRESENTATION component only. It does not perform
// any authorization check. Server-side enforcement is required for
// any protected data or action.

export function AccessDenied({
  title = "Access denied",
  message = "You do not have permission to view this page or perform this action.",
  requiredPermission,
  showContact = true,
  contactText = "If you believe this is an error, please contact your administrator.",
  icon,
  className,
}: AccessDeniedProps) {
  return (
    <div role="alert" className={clsx(styles.accessDenied, className)}>
      <span className={styles.iconWrap}>
        {icon ?? <Lock aria-hidden="true" />}
      </span>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
        {requiredPermission && (
          <p className={styles.permission}>
            <span className={styles.permissionLabel}>Required permission:</span>{" "}
            <code className={styles.permissionCode}>{requiredPermission}</code>
          </p>
        )}
        {showContact && <p className={styles.contact}>{contactText}</p>}
      </div>
    </div>
  );
}
