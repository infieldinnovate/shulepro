"use client";

import type { ReactNode } from "react";
import { Menu } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { IconButton } from "@/components/ui/Button";
import { AppSidebar } from "@/components/layout/AppSidebar";
import type { SidebarNavSection } from "@/components/layout/types";
import styles from "./MobileNavigation.module.scss";

export interface MobileNavigationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sections: SidebarNavSection[];
  brand?: ReactNode;
  onNavigate?: (href: string) => void;
  className?: string;
}

export function MobileNavigation({
  open,
  onOpenChange,
  sections,
  brand,
  onNavigate,
  className,
}: MobileNavigationProps) {
  const handleClose = () => onOpenChange(false);

  const handleNavigate = (href: string) => {
    onNavigate?.(href);
    handleClose();
  };

  return (
    <div className={styles.container}>
      <IconButton
        variant="ghost"
        size="md"
        label="Open navigation menu"
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => onOpenChange(true)}
        className={styles.trigger}
      >
        <Menu aria-hidden="true" />
      </IconButton>

      <Sheet
        open={open}
        onClose={handleClose}
        side="left"
        size="md"
        ariaLabel="Primary navigation"
        showCloseButton
        className={className}
      >
        <div id="mobile-navigation" className={styles.inner}>
          {brand && <div className={styles.brand}>{brand}</div>}
          <AppSidebar
            sections={sections}
            onNavigate={handleNavigate}
            className={styles.sidebar}
          />
        </div>
      </Sheet>
    </div>
  );
}
