"use client";

import { useCallback, useId, useState } from "react";
import type { ReactNode } from "react";
import { Loader as Loader2 } from "lucide-react";
import clsx from "clsx";
import { AlertDialog } from "@/components/ui/AlertDialog";
import styles from "./ApprovalActions.module.scss";

export type ApprovalActionVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive";

export interface ApprovalAction {
  id: string;
  label: ReactNode;
  variant?: ApprovalActionVariant;
  icon?: ReactNode;
  /** When true, show a confirm dialog before calling onSelect. */
  confirm?: {
    title: ReactNode;
    description?: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    /** Style the confirm as destructive (default true for destructive actions). */
    destructive?: boolean;
  };
  onSelect: () => void;
  disabled?: boolean;
}

export interface ApprovalActionsProps {
  actions: ApprovalAction[];
  /** Disable the whole toolbar. */
  disabled?: boolean;
  /** Action currently in flight; shows a spinner on that button. */
  processingActionId?: string | null;
  ariaLabel?: string;
  className?: string;
}

export function ApprovalActions({
  actions,
  disabled = false,
  processingActionId = null,
  ariaLabel = "Approval actions",
  className,
}: ApprovalActionsProps) {
  const generatedId = useId();
  const [pendingAction, setPendingAction] = useState<ApprovalAction | null>(null);

  const closeConfirm = useCallback(() => setPendingAction(null), []);

  const runAction = useCallback(
    (action: ApprovalAction) => {
      closeConfirm();
      action.onSelect();
    },
    [closeConfirm],
  );

  return (
    <div
      className={clsx(styles.toolbar, className)}
      role="toolbar"
      aria-label={ariaLabel}
    >
      {actions.map((action) => {
        const variant = action.variant ?? "outline";
        const isProcessing = processingActionId === action.id;
        const isDisabled = disabled || action.disabled || isProcessing;

        return (
          <button
            key={action.id}
            type="button"
            disabled={isDisabled}
            aria-busy={isProcessing || undefined}
            className={clsx(
              styles.button,
              styles[variant],
              isProcessing && styles.loading,
            )}
            onClick={() => {
              if (action.confirm) {
                setPendingAction(action);
              } else {
                action.onSelect();
              }
            }}
            aria-controls={
              pendingAction?.id === action.id
                ? `${generatedId}-dialog`
                : undefined
            }
          >
            {isProcessing ? (
              <Loader2
                className={clsx(styles.iconSlot, styles.spinner)}
                aria-hidden="true"
              />
            ) : (
              action.icon && (
                <span className={styles.iconSlot}>{action.icon}</span>
              )
            )}
            {action.label != null && (
              <span className={styles.label}>{action.label}</span>
            )}
          </button>
        );
      })}

      {pendingAction?.confirm && (
        <AlertDialog
          open={Boolean(pendingAction)}
          title={pendingAction.confirm.title}
          description={pendingAction.confirm.description}
          confirmLabel={pendingAction.confirm.confirmLabel ?? "Confirm"}
          cancelLabel={pendingAction.confirm.cancelLabel ?? "Cancel"}
          destructive={
            pendingAction.confirm.destructive ??
            pendingAction.variant === "destructive"
          }
          onConfirm={() => runAction(pendingAction)}
          onCancel={closeConfirm}
        />
      )}
    </div>
  );
}
