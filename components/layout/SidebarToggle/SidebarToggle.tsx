"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { IconButton } from "@/components/ui/Button";
import styles from "./SidebarToggle.module.scss";

export type SidebarToggleVariant = "header" | "mobile";

export interface SidebarToggleProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  open: boolean;
  onToggle: () => void;
  variant?: SidebarToggleVariant;
  label?: string;
}

export const SidebarToggle = forwardRef<
  HTMLButtonElement,
  SidebarToggleProps
>(
  (
    {
      open,
      onToggle,
      variant = "header",
      label,
      className,
      ...props
    },
    ref,
  ) => {
    const computedLabel =
      label ?? (open ? "Collapse sidebar" : "Expand sidebar");

    return (
      <IconButton
        ref={ref}
        variant="ghost"
        size="md"
        label={computedLabel}
        aria-expanded={open}
        aria-controls="app-sidebar"
        onClick={onToggle}
        className={`${styles.toggle} ${styles[variant]} ${className ?? ""}`}
        {...props}
      >
        {open ? (
          <PanelLeftClose aria-hidden="true" />
        ) : (
          <PanelLeftOpen aria-hidden="true" />
        )}
      </IconButton>
    );
  },
);

SidebarToggle.displayName = "SidebarToggle";
