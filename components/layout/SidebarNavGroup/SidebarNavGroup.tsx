"use client";

import { useId, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
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
  const generatedId = useId();
  const buttonId = `${generatedId}-button`;
  const panelId = `${generatedId}-panel`;
  const [open, setOpen] = useState(defaultOpen);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();
        setOpen((prev) => !prev);
        break;
      default:
        break;
    }
  };

  const hasActiveChild = items.some((item) => item.active);

  return (
    <div className={clsx(styles.group, className)}>
      <button
        id={buttonId}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        className={clsx(styles.trigger, hasActiveChild && styles.hasActive)}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
      >
        <span className={styles.label}>{label}</span>
        <ChevronDown
          className={clsx(styles.chevron, open && styles.chevronOpen)}
          aria-hidden="true"
        />
      </button>
      <ul
        id={panelId}
        role="group"
        hidden={!open}
        className={styles.list}
        aria-labelledby={buttonId}
      >
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
    </div>
  );
}
