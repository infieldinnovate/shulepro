import type { ReactNode } from "react";
import { Badge } from "../../ui/Badge";
import clsx from "clsx";
import styles from "./SidebarNavItem.module.scss";

export interface SidebarNavItemProps {
  label: ReactNode;
  href: string;
  icon?: ReactNode;
  badge?: {
    content: ReactNode;
    variant?:
      | "neutral"
      | "primary"
      | "success"
      | "warning"
      | "error"
      | "info";
  };
  active?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function SidebarNavItem({
  label,
  href,
  icon,
  badge,
  active = false,
  disabled = false,
  className,
  onClick,
}: SidebarNavItemProps) {
  if (disabled) {
    return (
      <span
        className={clsx(styles.item, styles.disabled, className)}
        aria-disabled="true"
      >
        {icon && <span className={styles.icon}>{icon}</span>}
        <span className={styles.label}>{label}</span>
        {badge && (
          <Badge variant={badge.variant} size="sm" className={styles.badge}>
            {badge.content}
          </Badge>
        )}
      </span>
    );
  }

  return (
    <a
      href={href}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={clsx(styles.item, active && styles.active, className)}
    >
      {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}
      <span className={styles.label}>{label}</span>
      {badge && (
        <Badge variant={badge.variant} size="sm" className={styles.badge}>
          {badge.content}
        </Badge>
      )}
    </a>
  );
}
