import type { ReactNode } from "react";
import clsx from "clsx";
import styles from "./PageToolbar.module.scss";

export interface PageToolbarProps {
  /** Leading controls (filters, sort selectors, search). */
  left?: ReactNode;
  /** Trailing controls (view toggles, actions). */
  right?: ReactNode;
  className?: string;
  /** Render raw toolbar children when slots are not needed. */
  children?: ReactNode;
}

export function PageToolbar({
  left,
  right,
  className,
  children,
}: PageToolbarProps) {
  return (
    <div className={clsx(styles.toolbar, className)} role="toolbar">
      {left && <div className={styles.left}>{left}</div>}
      {right && <div className={styles.right}>{right}</div>}
      {children}
    </div>
  );
}
