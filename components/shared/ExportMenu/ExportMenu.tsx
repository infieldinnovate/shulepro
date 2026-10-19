"use client";

import { useCallback, useId, useState } from "react";
import type { ReactNode } from "react";
import { Download, TriangleAlert as AlertTriangle, Loader as Loader2 } from "lucide-react";
import clsx from "clsx";
import { DropdownMenu } from "../../ui/DropdownMenu";
import type {
  DropdownMenuActionItem,
  DropdownMenuItem,
} from "../../ui/DropdownMenu";
import { Button } from "../../ui/Button";
import { Alert } from "../../ui/Alert";
import styles from "./ExportMenu.module.scss";

export interface ExportFormat {
  id: string;
  label: string;
  icon?: ReactNode;
}

export interface ExportMenuProps {
  formats: ExportFormat[];
  onExport: (formatId: string) => void | Promise<void>;
  /**
   * Controlled indicator of which format is currently exporting.
   * When set, the menu mirrors it and blocks further selections
   * until it clears. Falls back to internal pending state.
   */
  exportingFormatId?: string | null;
  disabled?: boolean;
  /** Trigger label. Defaults to "Export". */
  triggerLabel?: string;
  /** Where the dropdown aligns relative to the trigger. */
  align?: "start" | "center" | "end";
  className?: string;
}

export function ExportMenu({
  formats,
  onExport,
  exportingFormatId,
  disabled = false,
  triggerLabel = "Export",
  align = "end",
  className,
}: ExportMenuProps) {
  const labelId = useId();
  const [internalPending, setInternalPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isControlled = exportingFormatId !== undefined;
  const pendingId = isControlled ? exportingFormatId ?? null : internalPending;
  const isExporting = pendingId !== null;

  const handleExport = useCallback(
    async (formatId: string) => {
      if (isControlled) {
        try {
          setError(null);
          await onExport(formatId);
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Export failed. Please try again.";
          setError(message);
        }
        return;
      }

      setInternalPending(formatId);
      setError(null);
      try {
        await onExport(formatId);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Export failed. Please try again.";
        setError(message);
      } finally {
        setInternalPending(null);
      }
    },
    [isControlled, onExport],
  );

  const dismissError = useCallback(() => setError(null), []);

  const items: DropdownMenuItem[] = formats.map<DropdownMenuActionItem>(
    (format) => {
      const isThisPending = pendingId === format.id;
      return {
        id: format.id,
        type: "item",
        label: format.label,
        icon: isThisPending ? (
          <Loader2 className={styles.spinner} aria-hidden="true" />
        ) : (
          format.icon ?? <Download className={styles.formatIcon} aria-hidden="true" />
        ),
        disabled: disabled || isExporting,
        onSelect: () => {
          if (!isExporting && !disabled) void handleExport(format.id);
        },
      };
    },
  );

  const trigger = (
    <Button
      type="button"
      variant="outline"
      leftIcon={
        isExporting ? (
          <Loader2 className={styles.triggerSpinner} aria-hidden="true" />
        ) : (
          <Download aria-hidden="true" />
        )
      }
      loading={isExporting}
      disabled={disabled}
      aria-haspopup="menu"
      aria-label={triggerLabel}
    >
      {triggerLabel}
    </Button>
  );

  return (
    <div className={clsx(styles.wrapper, className)}>
      {error && (
        <Alert
          variant="error"
          title="Export failed"
          description={error}
          icon={<AlertTriangle aria-hidden="true" />}
          dismissible
          onDismiss={dismissError}
          className={styles.errorAlert}
        />
      )}
      {isExporting && !error && pendingId && (
        <p id={labelId} className={styles.statusText} aria-live="polite">
          Exporting {formats.find((f) => f.id === pendingId)?.label ?? pendingId}&hellip;
        </p>
      )}
      <DropdownMenu
        items={items}
        trigger={trigger}
        align={align}
        ariaLabel="Export formats"
      />
    </div>
  );
}
