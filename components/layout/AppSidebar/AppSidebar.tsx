import type { ReactNode } from "react";
import { Separator } from "@/components/ui/Separator";
import { SidebarNavGroup } from "@/components/layout/SidebarNavGroup";
import { SidebarNavItem } from "@/components/layout/SidebarNavItem";
import type { SidebarNavSection } from "@/components/layout/types";
import clsx from "clsx";
import styles from "./AppSidebar.module.scss";

export interface AppSidebarProps {
  sections: SidebarNavSection[];
  header?: ReactNode;
  footer?: ReactNode;
  collapsed?: boolean;
  onNavigate?: (href: string) => void;
  className?: string;
}

export function AppSidebar({
  sections,
  header,
  footer,
  collapsed = false,
  onNavigate,
  className,
}: AppSidebarProps) {
  return (
    <nav
      id="app-sidebar"
      aria-label="Primary"
      className={clsx(styles.sidebar, collapsed && styles.collapsed, className)}
      data-collapsed={collapsed || undefined}
    >
      {header && <div className={styles.header}>{header}</div>}

      <div className={styles.scrollArea}>
        {sections.map((section, sectionIndex) => (
          <section
            key={section.id}
            className={styles.section}
            aria-label={undefined}
          >
            {section.label && (
              <p className={styles.sectionLabel}>{section.label}</p>
            )}

            {section.items && section.items.length > 0 && (
              <ul className={styles.list}>
                {section.items.map((item) => (
                  <li key={item.id} className={styles.listItem}>
                    <SidebarNavItem
                      label={item.label}
                      href={item.href}
                      icon={item.icon}
                      badge={item.badge}
                      active={item.active}
                      disabled={item.disabled}
                      onClick={(e) => {
                        if (onNavigate) {
                          e.preventDefault();
                          onNavigate(item.href);
                        }
                      }}
                    />
                  </li>
                ))}
              </ul>
            )}

            {section.groups && section.groups.length > 0 && (
              <div className={styles.groups}>
                {section.groups.map((group) => (
                  <SidebarNavGroup
                    key={group.id}
                    label={group.label}
                    items={group.items}
                    defaultOpen={group.defaultOpen}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            )}

            {sectionIndex < sections.length - 1 && (
              <Separator className={styles.sectionSeparator} />
            )}
          </section>
        ))}
      </div>

      {footer && <div className={styles.footer}>{footer}</div>}
    </nav>
  );
}
