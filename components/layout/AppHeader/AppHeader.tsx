import type { ReactNode } from "react";
import clsx from "clsx";
import styles from "./AppHeader.module.scss";
 
export interface AppHeaderProps {
  /** Leading region: sidebar toggle, mobile nav trigger, brand, etc. */
  start?: ReactNode;
  /** Primary search widget (e.g. GlobalSearch). */
  search?: ReactNode;
  /** School switcher widget. */
  schoolSwitcher?: ReactNode;
  /** Academic period selector widget. */
  academicPeriodSelector?: ReactNode;
  /** Notification center widget. */
  notifications?: ReactNode;
  /** User menu widget. */
  userMenu?: ReactNode;
  /** Trailing slot for additional actions. Rendered after userMenu. */
  end?: ReactNode;
  /** Page or section title shown on narrow screens in place of search. */
  title?: ReactNode;
  /** Accessible label for the header landmark. */
  ariaLabel?: string;
  className?: string;
  children?: ReactNode;
}

export function AppHeader({
  start,
  search,
  schoolSwitcher,
  academicPeriodSelector,
  notifications,
  userMenu,
  end,
  title,
  ariaLabel = "Application header",
  className,
  children,
}: AppHeaderProps) {
  return (
    <header className={clsx(styles.header, className)} aria-label={ariaLabel}>
      <div className={styles.start}>
        {start}
        {title && <span className={styles.title}>{title}</span>}
      </div>

      {search && <div className={styles.search}>{search}</div>}

      <div className={styles.end}>
        {schoolSwitcher && (
          <span className={styles.widget}>{schoolSwitcher}</span>
        )}
        {academicPeriodSelector && (
          <span className={styles.widget}>{academicPeriodSelector}</span>
        )}
        {notifications && <span className={styles.widget}>{notifications}</span>}
        {userMenu && <span className={styles.widget}>{userMenu}</span>}
        {end}
      </div>

      {children}
    </header>
  );
}
