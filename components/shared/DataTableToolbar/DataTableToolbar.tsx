import type { ReactNode } from "react";
import clsx from "clsx";
import styles from "./DataTableToolbar.module.scss";

export interface DataTableToolbarProps {
  filters?: ReactNode;
  actions?: ReactNode;
  columnVisibilityToggle?: ReactNode;
  className?: string;
}

export function DataTableToolbar({
  filters,
  actions,
  columnVisibilityToggle,
  className,
}: DataTableToolbarProps) {
  const hasRight = Boolean(actions || columnVisibilityToggle);

  return (
    <div className={clsx(styles.toolbar, className)}>
      {filters && <div className={styles.filters}>{filters}</div>}
      {hasRight && (
        <div className={styles.actions}>
          {actions}
          {columnVisibilityToggle}
        </div>
      )}
    </div>
  );
}
