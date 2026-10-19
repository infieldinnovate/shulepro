"use client";

import { useCallback, useId, useState } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import clsx from "clsx";
import { Button } from "../../ui/Button";
import { IconButton } from "../../ui/Button/IconButton";
import { AlertDialog } from "../../ui/AlertDialog";
import styles from "./BulkActionBar.module.scss";

export interface BulkActionConfirm {
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

export interface BulkAction {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  onSelect: () => void;
  destructive?: boolean;
  disabled?: boolean;
  confirm?: BulkActionConfirm;
}

export interface BulkActionBarProps {
  selectedCount: number;
  totalCount?: number;
  onClearSelection: () => void;
  actions: BulkAction[];
  ariaLabel?: string;
  className?: string;
}

export function BulkActionBar({
  selectedCount,
  totalCount,
  onClearSelection,
  actions,
  ariaLabel = "Bulk actions",
  className,
}: BulkActionBarProps) {
  const generatedId = useId();
  const [pendingAction, setPendingAction] = useState<BulkAction | null>(null);

  const closeConfirm = useCallback(() => setPendingAction(null), []);

  const runAction = useCallback(
    (action: BulkAction) => {
      closeConfirm();
      action.onSelect();
    },
    [closeConfirm],
  );

  const handleActionClick = useCallback((action: BulkAction) => {
    if (action.confirm) {
      setPendingAction(action);
    } else {
      action.onSelect();
    }
  }, []);

  const countLabel =
    typeof totalCount === "number"
      ? `${selectedCount} of ${totalCount} selected`
      : `${selectedCount} selected`;

  return (
    <div
      className={clsx(styles.bar, className)}
      role="toolbar"
      aria-label={ariaLabel}
    >
      <div className={styles.info}>
        <IconButton
          label="Clear selection"
          onClick={onClearSelection}
          size="sm"
          className={styles.clearButton}
        >
          <X size={16} aria-hidden="true" />
        </IconButton>
        <span className={styles.count} aria-live="polite">
          {countLabel}
        </span>
      </div>

      <div className={styles.actions}>
        {actions.map((action) => (
          <Button
            key={action.id}
            variant={action.destructive ? "destructive" : "outline"}
            size="sm"
            leftIcon={action.icon}
            disabled={action.disabled}
            fullWidth
            className={styles.actionButton}
            onClick={() => handleActionClick(action)}
            aria-controls={
              pendingAction?.id === action.id
                ? `${generatedId}-dialog`
                : undefined
            }
          >
            {action.label}
          </Button>
        ))}
      </div>

      {pendingAction?.confirm && (
        <AlertDialog
          open={Boolean(pendingAction)}
          title={pendingAction.confirm.title}
          description={pendingAction.confirm.description}
          confirmLabel={pendingAction.confirm.confirmLabel ?? "Confirm"}
          cancelLabel={pendingAction.confirm.cancelLabel ?? "Cancel"}
          destructive={
            pendingAction.confirm.destructive ??
            pendingAction.destructive ??
            false
          }
          onConfirm={() => runAction(pendingAction)}
          onCancel={closeConfirm}
        />
      )}
    </div>
  );
}
