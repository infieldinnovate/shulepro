import type { ReactNode } from "react";
import clsx from "clsx";
import styles from "./PageHeader.module.scss";

export interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  /** Breadcrumbs slot (typically the Breadcrumbs wrapper). */
  breadcrumbs?: ReactNode;
  /** Primary/secondary action buttons, rendered inline-end. */
  actions?: ReactNode;
  className?: string;
  /** Extra content rendered below the title row. */
  children?: ReactNode;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
  children,
}: PageHeaderProps) {
  return (
    <header className={clsx(styles.header, className)}>
      {breadcrumbs && <div className={styles.breadcrumbs}>{breadcrumbs}</div>}
      <div className={styles.top}>
        <div className={styles.titles}>
          <h1 className={styles.title}>{title}</h1>
          {description && (
            <p className={styles.description}>{description}</p>
          )}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      {children}
    </header>
  );
}
