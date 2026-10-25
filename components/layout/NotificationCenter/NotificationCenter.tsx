"use client";

import type { ReactNode } from "react";
import { Bell, Check, X } from "lucide-react";
import { IconButton } from "@/components/ui/Button";
import { Popover } from "@/components/ui/Popover";
import { Badge } from "@/components/ui/Badge";
import { Separator } from "@/components/ui/Separator";
import clsx from "clsx";
import type { NotificationItem } from "@/components/layout/headerTypes";
import { formatAbsolute, formatRelativeTime } from "@/lib/formatTime";
import styles from "./NotificationCenter.module.scss";

export interface NotificationCenterProps {
  notifications: NotificationItem[];
  onOpen?: () => void;
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  onDismiss?: (id: string) => void;
  onSelect?: (notification: NotificationItem) => void;
  emptyText?: string;
  ariaLabel?: string;
  className?: string;
}

const VARIANT_ICON: Record<NonNullable<NotificationItem["variant"]>, ReactNode> = {
  info: null,
  success: <Check aria-hidden="true" />,
  warning: null,
  error: null,
};

export function NotificationCenter({
  notifications,
  onOpen,
  onMarkRead,
  onMarkAllRead,
  onDismiss,
  onSelect,
  emptyText = "No notifications",
  ariaLabel = "Notifications",
  className,
}: NotificationCenterProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Popover
      align="end"
      ariaLabel={ariaLabel}
      contentClassName={styles.content}
      className={clsx(styles.container, className)}
      trigger={
        <IconButton
          variant="ghost"
          size="md"
          label={ariaLabel}
          aria-haspopup="dialog"
          onClick={() => onOpen?.()}
          className={styles.trigger}
        >
          <Bell aria-hidden="true" />
          {unreadCount > 0 && (
            <Badge variant="error" size="sm" className={styles.countBadge}>
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </IconButton>
      }
    >
      <div className={styles.panel}>
        <header className={styles.header}>
          <h2 className={styles.title}>Notifications</h2>
          {unreadCount > 0 && (
            <button
              type="button"
              className={styles.markAllButton}
              onClick={onMarkAllRead}
            >
              Mark all read
            </button>
          )}
        </header>

        {notifications.length === 0 ? (
          <p className={styles.empty}>{emptyText}</p>
        ) : (
          <ul className={styles.list}>
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={clsx(
                  styles.item,
                  !notification.read && styles.unread,
                )}
              >
                <button
                  type="button"
                  className={styles.itemMain}
                  onClick={() => {
                    onSelect?.(notification);
                  }}
                >
                  <span
                    className={styles.dot}
                    data-variant={notification.variant ?? "info"}
                    aria-hidden="true"
                  >
                    {VARIANT_ICON[notification.variant ?? "info"]}
                  </span>
                  <span className={styles.itemContent}>
                    <span className={styles.itemTitle}>{notification.title}</span>
                    {notification.description && (
                      <span className={styles.itemDescription}>
                        {notification.description}
                      </span>
                    )}
                    <time
                      className={styles.itemTime}
                      dateTime={
                        typeof notification.timestamp === "string"
                          ? notification.timestamp
                          : new Date(notification.timestamp).toISOString()
                      }
                      title={formatAbsolute(notification.timestamp)}
                    >
                      {formatRelativeTime(notification.timestamp)}
                    </time>
                  </span>
                </button>
                <span className={styles.itemActions}>
                  {!notification.read && (
                    <IconButton
                      variant="ghost"
                      size="sm"
                      label="Mark as read"
                      onClick={() => onMarkRead?.(notification.id)}
                      className={styles.actionButton}
                    >
                      <Check aria-hidden="true" />
                    </IconButton>
                  )}
                  <IconButton
                    variant="ghost"
                    size="sm"
                    label="Dismiss notification"
                    onClick={() => onDismiss?.(notification.id)}
                    className={styles.actionButton}
                  >
                    <X aria-hidden="true" />
                  </IconButton>
                </span>
              </li>
            ))}
          </ul>
        )}
        {notifications.length > 0 && (
          <footer className={styles.footer}>
            <Separator />
            <span className={styles.footerText}>
              {unreadCount > 0
                ? `${unreadCount} unread`
                : "All caught up"}
            </span>
          </footer>
        )}
      </div>
    </Popover>
  );
}

export type { NotificationItem } from "@/components/layout/headerTypes";
