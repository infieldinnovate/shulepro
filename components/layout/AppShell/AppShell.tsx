"use client";
 
import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { SidebarToggle } from "@/components/layout/SidebarToggle";
import type { SidebarNavSection } from "@/components/layout/types";
import clsx from "clsx";
import styles from "./AppShell.module.scss";

export interface AppShellProps {
  children: ReactNode;
  sections: SidebarNavSection[];
  brand?: ReactNode;
  sidebarHeader?: ReactNode;
  sidebarFooter?: ReactNode;
  header?: ReactNode;
  headerEnd?: ReactNode;
  initialSidebarCollapsed?: boolean;
  onNavigate?: (href: string) => void;
  className?: string;
}

export function AppShell({
  children,
  sections,
  brand,
  sidebarHeader,
  sidebarFooter,
  header,
  headerEnd,
  initialSidebarCollapsed = false,
  onNavigate,
  className,
}: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    initialSidebarCollapsed,
  );
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const handleNavigate = useCallback(
    (href: string) => {
      onNavigate?.(href);
    },
    [onNavigate],
  );

  return (
    <div className={clsx(styles.shell, className)}>
      <AppSidebar
        sections={sections}
        header={sidebarHeader ?? brand}
        footer={sidebarFooter}
        collapsed={sidebarCollapsed}
        onNavigate={handleNavigate}
        className={styles.desktopSidebar}
      />

      <div className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerStart}>
            <MobileNavigation
              open={mobileNavOpen}
              onOpenChange={setMobileNavOpen}
              sections={sections}
              brand={brand}
              onNavigate={handleNavigate}
            />
            <SidebarToggle
              open={!sidebarCollapsed}
              onToggle={toggleSidebar}
              variant="header"
            />
            {header}
          </div>
          {headerEnd && <div className={styles.headerEnd}>{headerEnd}</div>}
        </header>

        <main id="app-content" className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
