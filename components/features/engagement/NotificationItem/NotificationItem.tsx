"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import clsx from "clsx";
import { Card } from "../../../ui/Card";
import { IconButton } from "../../../ui/Button/IconButton";
import { Spinner } from "../../../ui/Spinner";
import { EmptyState } from "../../../ui/EmptyState";
import {
  Bell,
  CheckCircle2,
  X,
  Info,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import type { NotificationItem as NotificationItemModel, DisabledState } from "../models";
import styles from "./NotificationItem.module.scss";

export type NotificationSeverity = "info" | "success" | "warning" | "error";

export interface NotificationItemProps {
  /** Notification data — supplied via props. */
  notification?: NotificationItemModel | null;
  /** Visual severity — maps to an icon and accent color. */
  severity?: NotificationSeverity;
  /** Callback when the user dismisses the notification. */
  onDismiss?: (id: string) => void;
  /** Callback when the user marks the notification as read. */
  onMarkRead?: (id: string) => void;
  /** Loading state. */
  loading?: boolean;
  /** Disabled state. */
  disabled?: DisabledState;
  /** Optional action slot (e.g. a link to the target). */
  actions?: ReactNode;
  className?: string;
}

const SEVERITY_ICON: Record<NotificationSeverity, ReactNode> = {
  info: <Info aria-hidden="true" />,
  success: <CheckCircle2 aria-hidden="true" />,
  warning: <AlertTriangle aria-hidden="true" />,
  error: <AlertCircle aria-hidden="true" />,
};

function formatTimeLabel(value?: Date | string): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (date instanceof Date && !Number.isNaN(date.getTime())) {
    return date.toLocaleString();
  }
  return typeof value === "string" ? value : "";
}

export function NotificationItem({
  notification,
  severity = "info",
  onDismiss,
  onMarkRead,
  loading = false,
  disabled,
  actions,
  className,
}: NotificationItemProps) {
  const [dismissing, setDismissing] = useState(false);

  if (loading) {
    return (
      <Card padded className={clsx(styles.loading, className)}>
        <Spinner size="sm" label="Loading notification" />
      </Card>
    );
  }

  if (!notification) {
    return (
      <Card padded className={clsx(styles.empty, className)}>
        <EmptyState
          icon={<Bell aria-hidden="true" />}
          title="No notification"
          description="No notification to display."
        />
      </Card>
    );
  }

  const isDisabled = Boolean(disabled?.disabled);
  const isUnread = !notification.read;

  const handleDismiss = () => {
    if (isDisabled || dismissing) return;
    setDismissing(true);
    onDismiss?.(notification.id);
  };

  return (
    <Card
      padded={false}
      className={clsx(
        styles.item,
        styles[severity],
        isUnread && styles.unread,
        isDisabled && styles.disabled,
        className,
      )}
      aria-disabled={isDisabled || undefined}
    >
      <div className={styles.body}>
        <span className={styles.icon}>{SEVERITY_ICON[severity]}</span>
        <div className={styles.content}>
          <div className={styles.topRow}>
            <h4 className={styles.title}>{notification.title}</h4>
            {isUnread && <span className={styles.unreadDot} aria-label="Unread" />}
          </div>
          {notification.description && (
            <p className={styles.description}>{notification.description}</p>
          )}
          <div className={styles.meta}>
            {notification.category && (
              <span className={styles.category}>{notification.category}</span>
            )}
            <time className={styles.timestamp}>
              {formatTimeLabel(notification.createdAt)}
            </time>
          </div>
          {actions && <div className={styles.actions}>{actions}</div>}
          {isDisabled && disabled?.disabledReason && (
            <p className={styles.disabledReason}>{disabled.disabledReason}</p>
          )}
        </div>
        <div className={styles.controls}>
          {isUnread && onMarkRead && (
            <IconButton
              variant="ghost"
              size="sm"
              label="Mark as read"
              disabled={isDisabled}
              onClick={() => onMarkRead?.(notification.id)}
            >
              <CheckCircle2 aria-hidden="true" />
            </IconButton>
          )}
          {onDismiss && (
            <IconButton
              variant="ghost"
              size="sm"
              label="Dismiss"
              disabled={isDisabled || dismissing}
              loading={dismissing}
              onClick={handleDismiss}
            >
              <X aria-hidden="true" />
            </IconButton>
          )}
        </div>
      </div>
    </Card>
  );
}