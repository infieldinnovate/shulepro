"use client";

import type { ReactNode } from "react";
import { MoveHorizontal as MoreHorizontal, Trash as Trash2 } from "lucide-react";
import clsx from "clsx";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import type { DropdownMenuItem } from "@/components/ui/DropdownMenu";
import { IconButton } from "@/components/ui/Button";
import styles from "./DataTableRowActions.module.scss";

export interface DataTableRowActionItem {
  id?: string;
  label: ReactNode;
  icon?: ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  destructive?: boolean;
}

export interface DataTableRowActionsProps {
  actions: DataTableRowActionItem[];
  ariaLabel?: string;
  triggerIcon?: ReactNode;
  triggerLabel?: string;
  className?: string;
}

export function DataTableRowActions({
  actions,
  ariaLabel = "Row actions",
  triggerIcon,
  triggerLabel = "Open row actions",
  className,
}: DataTableRowActionsProps) {
  if (actions.length === 0) return null;

  const menuItems: DropdownMenuItem[] = [];
  let insertedDivider = false;

  actions.forEach((action, idx) => {
    if (action.destructive && !insertedDivider && menuItems.length > 0) {
      menuItems.push({ type: "divider" });
      insertedDivider = true;
    }
    menuItems.push({
      type: "item",
      id: action.id ?? `action-${idx}`,
      label: action.label,
      icon: action.destructive
        ? (action.icon ?? <Trash2 aria-hidden="true" />)
        : action.icon,
      disabled: action.disabled,
      onSelect: action.onSelect,
    });
  });

  const trigger = (
    <IconButton
      variant="ghost"
      size="md"
      label={triggerLabel}
      className={styles.trigger}
    >
      {triggerIcon ?? <MoreHorizontal aria-hidden="true" />}
    </IconButton>
  );

  return (
    <DropdownMenu
      items={menuItems}
      trigger={trigger}
      ariaLabel={ariaLabel}
      align="end"
      className={clsx(styles.root, className)}
    />
  );
}
