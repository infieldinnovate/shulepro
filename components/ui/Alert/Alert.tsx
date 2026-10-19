import { useState } from "react";
import type { ReactNode } from "react";
import { Info, CheckCircle2, AlertTriangle, XCircle, X } from "lucide-react";
import clsx from "clsx";
import styles from "./Alert.module.scss";

export type AlertVariant = "info" | "success" | "warning" | "error";

export interface AlertProps {
  variant?: AlertVariant;
  title?: ReactNode;
  description?: ReactNode;
  /** Override the default variant icon. */
  icon?: ReactNode | false;
  /** Show a close button and allow dismissal. */
  dismissible?: boolean;
  /** Controlled dismiss callback. */
  onDismiss?: () => void;
  className?: string;
  children?: ReactNode;
}

const DEFAULT_ICONS: Record<AlertVariant, ReactNode> = {
  info: <Info aria-hidden="true" />,
  success: <CheckCircle2 aria-hidden="true" />,
  warning: <AlertTriangle aria-hidden="true" />,
  error: <XCircle aria-hidden="true" />,
};

export function Alert({
  variant = "info",
  title,
  description,
  icon,
  dismissible = false,
  onDismiss,
  className,
  children,
}: AlertProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const resolvedIcon = icon === false ? null : icon ?? DEFAULT_ICONS[variant];
  const role = variant === "error" || variant === "warning" ? "alert" : "status";

  return (
    <div
      role={role}
      className={clsx(styles.alert, styles[variant], className)}
    >
      {resolvedIcon && <span className={styles.icon}>{resolvedIcon}</span>}
      <div className={styles.content}>
        {title && <p className={styles.title}>{title}</p>}
        {description && <div className={styles.description}>{description}</div>}
        {children}
      </div>
      {dismissible && (
        <button
          type="button"
          className={styles.closeButton}
          aria-label="Dismiss"
          onClick={handleDismiss}
        >
          <X aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
