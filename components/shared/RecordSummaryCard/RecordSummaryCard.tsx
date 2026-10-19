"use client";

import type { KeyboardEvent, ReactNode } from "react";
import clsx from "clsx";
import { Card } from "../../ui/Card";
import { Avatar } from "../../ui/Avatar";
import styles from "./RecordSummaryCard.module.scss";

export interface RecordSummaryCardProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Labeled meta entries rendered inline (desktop) / stacked (mobile). */
  meta?: ReactNode[];
  /** Optional status badge / indicator rendered near the title. */
  status?: ReactNode;
  /** Optional avatar rendered before the title. */
  avatar?: ReactNode;
  /** Action buttons / menu rendered inline-end on desktop, stacked on mobile. */
  actions?: ReactNode;
  /** When provided, the card becomes a button-like clickable element. */
  onClick?: () => void;
  /** Accessible label for the clickable card. */
  ariaLabel?: string;
  className?: string;
}

export function RecordSummaryCard({
  title,
  subtitle,
  meta,
  status,
  avatar,
  actions,
  onClick,
  ariaLabel,
  className,
}: RecordSummaryCardProps) {
  const clickable = typeof onClick === "function";
  const hasMeta = Array.isArray(meta) && meta.length > 0;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!clickable) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick?.();
    }
  };

  return (
    <Card
      padded={false}
      className={clsx(
        styles.card,
        clickable && styles.clickable,
        className,
      )}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-label={clickable ? ariaLabel : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.header}>
        {avatar && <div className={styles.avatar}>{avatar}</div>}
        <div className={styles.titles}>
          <div className={styles.titleRow}>
            <h3 className={styles.title}>{title}</h3>
            {status && <span className={styles.status}>{status}</span>}
          </div>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>

      {hasMeta && (
        <dl className={styles.metaGrid}>
          {meta!.map((entry, index) => (
            <div className={styles.metaItem} key={index}>
              {entry}
            </div>
          ))}
        </dl>
      )}
    </Card>
  );
}

// Convenience re-export so callers can pair an Avatar without a separate import.
export { Avatar };
