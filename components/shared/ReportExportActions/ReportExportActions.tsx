import type { ReactNode } from "react";
import clsx from "clsx";
import { ExportMenu } from "@/components/shared/ExportMenu";
import type { ExportFormat } from "@/components/shared/ExportMenu";
import styles from "./ReportExportActions.module.scss";

export interface ReportExportActionsProps {
  /** Typed list of formats the report can be exported as. */
  formats: ExportFormat[];
  /** Fired when a format is selected. */
  onExport: (formatId: string) => void | Promise<void>;
  /** Controlled id of the format currently exporting. */
  exportingFormatId?: string | null;
  /** Disable all export actions. */
  disabled?: boolean;
  /** Trigger label. Defaults to "Export report". */
  triggerLabel?: string;
  /** Optional helper text shown above the menu. */
  helperText?: ReactNode;
  /** Optional accessible label for the actions region. */
  ariaLabel?: string;
  /** Dropdown alignment. */
  align?: "start" | "center" | "end";
  className?: string;
}

export function ReportExportActions({
  formats,
  onExport,
  exportingFormatId,
  disabled = false,
  triggerLabel = "Export report",
  helperText,
  ariaLabel = "Report export actions",
  align = "end",
  className,
}: ReportExportActionsProps) {
  if (formats.length === 0) return null;

  return (
    <div
      className={clsx(styles.wrapper, className)}
      role="group"
      aria-label={ariaLabel}
    >
      {helperText && <p className={styles.helper}>{helperText}</p>}
      <ExportMenu
        formats={formats}
        onExport={onExport}
        exportingFormatId={exportingFormatId}
        disabled={disabled}
        triggerLabel={triggerLabel}
        align={align}
      />
    </div>
  );
}

export type { ExportFormat };
