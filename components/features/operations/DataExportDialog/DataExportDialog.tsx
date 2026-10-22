"use client";

import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import { Download, Loader as Loader2, TriangleAlert as AlertTriangle } from "lucide-react";
import clsx from "clsx";
import { Dialog } from "../../../ui/Dialog";
import { Button } from "../../../ui/Button";
import { Alert } from "../../../ui/Alert";
import type { ExportFormatOption } from "../types";
import styles from "./DataExportDialog.module.scss";

export interface DataExportDialogProps {
  open: boolean;
  onClose: () => void;
  formats: ExportFormatOption[];
  onExport: (formatId: string) => void | Promise<void>;
  title?: ReactNode;
  description?: ReactNode;
  exportingFormatId?: string | null;
  className?: string;
}

export function DataExportDialog({
  open,
  onClose,
  formats,
  onExport,
  title = "Export data",
  description = "Choose a format for your export.",
  exportingFormatId = null,
  className,
}: DataExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [internalPending, setInternalPending] = useState<string | null>(null);

  const isControlled = exportingFormatId !== undefined;
  const pendingId = isControlled ? exportingFormatId ?? null : internalPending;
  const isExporting = pendingId !== null;

  const handleExport = useCallback(async () => {
    if (!selectedFormat || isExporting) return;
    setError(null);
    if (!isControlled) setInternalPending(selectedFormat);
    try {
      await onExport(selectedFormat);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Export failed. Please try again.";
      setError(message);
    } finally {
      if (!isControlled) setInternalPending(null);
    }
  }, [selectedFormat, isExporting, isControlled, onExport]);

  const dismissError = useCallback(() => setError(null), []);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      className={clsx(styles.dialog, className)}
      footer={
        <div className={styles.footer}>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isExporting}
          >
            Close
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleExport}
            loading={isExporting}
            disabled={!selectedFormat || isExporting}
            leftIcon={<Download aria-hidden="true" />}
          >
            Export
          </Button>
        </div>
      }
    >
      <div className={styles.body}>
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

        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Format</legend>
          <div className={styles.formatList}>
            {formats.map((format) => {
              const isSelected = selectedFormat === format.id;
              const isThisPending = pendingId === format.id;
              return (
                <label
                  key={format.id}
                  className={clsx(
                    styles.formatOption,
                    isSelected && styles.formatSelected,
                  )}
                >
                  <input
                    type="radio"
                    name="exportFormat"
                    value={format.id}
                    checked={isSelected}
                    onChange={() => setSelectedFormat(format.id)}
                    disabled={isExporting}
                    className={styles.radioInput}
                  />
                  <span className={styles.formatContent}>
                    {isThisPending ? (
                      <Loader2 className={styles.formatSpinner} aria-hidden="true" />
                    ) : (
                      <Download className={styles.formatIcon} aria-hidden="true" />
                    )}
                    <span className={styles.formatText}>
                      <span className={styles.formatLabel}>{format.label}</span>
                      {format.description && (
                        <span className={styles.formatDescription}>
                          {format.description}
                        </span>
                      )}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>
    </Dialog>
  );
}
