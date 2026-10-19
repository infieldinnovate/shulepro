import type { ReactNode } from "react";
import clsx from "clsx";
import styles from "./PageContainer.module.scss";

export interface PageContainerProps {
  /** Remove default padding; useful when a child owns its own spacing. */
  flush?: boolean;
  /** Override the max-width constraint (defaults to --container-max). */
  maxWidth?: string | number;
  className?: string;
  children?: ReactNode;
}

export function PageContainer({
  flush = false,
  maxWidth,
  className,
  children,
}: PageContainerProps) {
  return (
    <div
      className={clsx(styles.container, flush && styles.flush, className)}
      style={maxWidth != null ? { maxInlineSize: maxWidth } : undefined}
    >
      {children}
    </div>
  );
}
