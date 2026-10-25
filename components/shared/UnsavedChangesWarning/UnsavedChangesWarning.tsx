import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/ui/Button";
import styles from "./UnsavedChangesWarning.module.scss";

export interface UnsavedChangesWarningProps {
  message?: string;
  onDiscard?: () => void;
  onSave?: () => void;
  isDirty?: boolean;
  discardLabel?: string;
  saveLabel?: string;
  icon?: ReactNode;
  className?: string;
}

export function UnsavedChangesWarning({
  message = "You have unsaved changes.",
  onDiscard,
  onSave,
  isDirty = false,
  discardLabel = "Discard",
  saveLabel = "Save",
  icon,
  className,
}: UnsavedChangesWarningProps) {
  if (!isDirty) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={clsx(styles.warning, className)}
    >
      <span className={styles.icon}>
        {icon ?? <AlertTriangle aria-hidden="true" />}
      </span>
      <p className={styles.message}>{message}</p>
      {(onDiscard || onSave) && (
        <div className={styles.actions}>
          {onSave && (
            <Button
              variant="primary"
              size="sm"
              onClick={onSave}
              aria-label={saveLabel}
            >
              {saveLabel}
            </Button>
          )}
          {onDiscard && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDiscard}
              aria-label={discardLabel}
            >
              {discardLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
