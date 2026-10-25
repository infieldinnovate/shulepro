"use client";

import type { ReactNode } from "react";
import clsx from "clsx";
import { Accordion } from "@/components/ui/Accordion";
import { SidebarNavItem } from "@/components/layout/SidebarNavItem";
import type { SidebarNavItemData } from "@/components/layout/types";
import styles from "./SidebarNavGroup.module.scss";

export interface SidebarNavGroupProps {
  label: ReactNode;
  items: SidebarNavItemData[];
  defaultOpen?: boolean;
  className?: string;
  onNavigate?: (href: string) => void;
}

export function SidebarNavGroup({
  label,
  items,
  defaultOpen = false,
  className,
  onNavigate,
}: SidebarNavGroupProps) {
  const hasActiveChild = items.some((item) => item.active);

  return (
    <Accordion
      className={clsx(styles.group, hasActiveChild && styles.hasActive, className)}
      defaultOpenIndices={defaultOpen ? [0] : []}
      items={[
        {
          header: <span className={styles.label}>{label}</span>,
          panel: (
            <ul className={styles.list}>
              {items.map((item) => (
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
          ),
        },
      ]}
    />
  );
}
