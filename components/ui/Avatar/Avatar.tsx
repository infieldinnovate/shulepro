"use client";

import { useState, Children } from "react";
import { isValidElement, type ReactNode } from "react";
import clsx from "clsx";
import styles from "./Avatar.module.scss";

export type AvatarSize = "sm" | "md" | "lg" | "xl";

export type AvatarStatus = "online" | "offline" | "busy" | "away";

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  /** Render a small status dot (positioned bottom-inline-end). */
  status?: AvatarStatus;
  className?: string;
}

const STATUS_LABEL: Record<AvatarStatus, string> = {
  online: "Online",
  offline: "Offline",
  busy: "Busy",
  away: "Away",
};

function initialsFromName(name?: string): string | null {
  if (!name) return null;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return null;
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({
  src,
  alt,
  name,
  size = "md",
  status,
  className,
}: AvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(src) && !imageFailed;
  const initials = initialsFromName(name);
  const ariaLabel = alt ?? name ?? "Avatar";

  return (
    <span
      className={clsx(styles.avatar, styles[size], className)}
      data-status={status ?? undefined}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className={styles.image}
          src={src}
          alt={ariaLabel}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className={styles.fallback} aria-hidden={Boolean(initials)}>
          {initials ?? <span className={styles.glyph}>&#9679;</span>}
        </span>
      )}
      {status && (
        <span
          className={clsx(styles.status, styles[`status-${status}`])}
          role="img"
          aria-label={STATUS_LABEL[status]}
        />
      )}
    </span>
  );
}

export interface AvatarGroupProps {
  /** Maximum number of avatars to render before an overflow indicator. */
  max?: number;
  className?: string;
  children: ReactNode;
}

export function AvatarGroup({ max, className, children }: AvatarGroupProps) {
  const items = Children.toArray(children).filter(isValidElement);
  const limit = typeof max === "number" && max >= 0 ? max : items.length;
  const visible = items.slice(0, limit);
  const overflow = Math.max(0, items.length - limit);

  return (
    <span className={clsx(styles.group, className)}>
      {visible.map((child, index) => (
        <span key={index} className={styles.groupItem}>
          {child}
        </span>
      ))}
      {overflow > 0 && (
        <span className={clsx(styles.avatar, styles.overflow)}>
          +{overflow}
        </span>
      )}
    </span>
  );
}