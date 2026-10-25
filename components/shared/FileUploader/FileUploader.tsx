"use client";

import {
  useCallback,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
} from "react";
import { UploadCloud, X, FileWarning } from "lucide-react";
import clsx from "clsx";
import { IconButton } from "@/components/ui/Button/IconButton";
import { Alert } from "@/components/ui/Alert";
import styles from "./FileUploader.module.scss";

export interface FileValidationIssue {
  file: File;
  reason: string;
}

export interface FileUploaderProps {
  /** Accepted MIME types or extensions, e.g. ["image/png", ".pdf"]. */
  accept?: string[];
  /** Maximum number of files allowed in a single selection. */
  maxFiles?: number;
  /** Maximum size per file in bytes. */
  maxSizeBytes?: number;
  /** Called with the list of valid files when the user selects/drops them. */
  onFilesSelected: (files: File[]) => void;
  /** Called with files that failed validation. */
  onValidationFail?: (issues: FileValidationIssue[]) => void;
  disabled?: boolean;
  /** Allow multiple files. Defaults to false. */
  multiple?: boolean;
  helperText?: ReactNode;
  /** Accessible label for the drop region. */
  ariaLabel?: string;
  className?: string;
}

function matchesAccept(file: File, accept?: string[]): boolean {
  if (!accept || accept.length === 0) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return accept.some((token) => {
    const t = token.trim().toLowerCase();
    if (!t) return false;
    if (t.startsWith(".")) return name.endsWith(t);
    if (t.endsWith("/*")) return type.startsWith(t.slice(0, -1));
    return type === t;
  });
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unit]}`;
}

export function FileUploader({
  accept,
  maxFiles,
  maxSizeBytes,
  onFilesSelected,
  onValidationFail,
  disabled = false,
  multiple = false,
  helperText,
  ariaLabel = "File upload",
  className,
}: FileUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selected, setSelected] = useState<File[]>([]);
  const [issues, setIssues] = useState<FileValidationIssue[]>([]);
  const dragDepth = useRef(0);

  const validate = useCallback(
    (files: File[]): { valid: File[]; invalid: FileValidationIssue[] } => {
      const valid: File[] = [];
      const invalid: FileValidationIssue[] = [];
      const limit = multiple ? maxFiles ?? Infinity : 1;

      for (const file of files) {
        if (!matchesAccept(file, accept)) {
          invalid.push({ file, reason: `File type not allowed: ${file.type || file.name}` });
          continue;
        }
        if (maxSizeBytes != null && file.size > maxSizeBytes) {
          invalid.push({
            file,
            reason: `File exceeds the ${formatBytes(maxSizeBytes)} size limit (is ${formatBytes(file.size)})`,
          });
          continue;
        }
        if (valid.length >= limit) {
          invalid.push({ file, reason: "Maximum number of files reached" });
          continue;
        }
        valid.push(file);
      }
      return { valid, invalid };
    },
    [accept, maxSizeBytes, maxFiles, multiple],
  );

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      if (disabled) return;
      const incoming = Array.from(files);
      const { valid, invalid } = validate(incoming);

      let nextSelected = valid;
      setSelected((prev) => {
        if (!multiple) {
          nextSelected = valid;
          return valid;
        }
        const combined = [...prev, ...valid];
        // Re-apply maxFiles across the combined set.
        if (maxFiles != null && combined.length > maxFiles) {
          const overflow = combined.slice(maxFiles);
          for (const file of overflow) {
            invalid.push({ file, reason: "Maximum number of files reached" });
          }
          nextSelected = combined.slice(0, maxFiles);
          return nextSelected;
        }
        nextSelected = combined;
        return combined;
      });

      setIssues(invalid);
      if (invalid.length > 0) onValidationFail?.(invalid);
      if (nextSelected.length > 0) onFilesSelected(nextSelected);
    },
    [disabled, validate, multiple, maxFiles, onFilesSelected, onValidationFail],
  );

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) handleFiles(event.target.files);
    // Reset so selecting the same file again still fires change.
    event.target.value = "";
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragDepth.current = 0;
    setIsDragging(false);
    if (disabled) return;
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      handleFiles(event.dataTransfer.files);
    }
  };

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const onDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (disabled) return;
    dragDepth.current += 1;
    setIsDragging(true);
  };

  const onDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setIsDragging(false);
  };

  const openPicker = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPicker();
    }
  };

  const removeFile = (index: number) => {
    setSelected((prev) => {
      const next = prev.filter((_, i) => i !== index);
      onFilesSelected(next);
      return next;
    });
  };

  const dismissIssue = (index: number) => {
    setIssues((prev) => prev.filter((_, i) => i !== index));
  };

  const acceptString = accept?.join(",") || undefined;

  return (
    <div className={clsx(styles.uploader, disabled && styles.disabled, className)}>
      <div
        className={clsx(styles.dropzone, isDragging && styles.dragging)}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        aria-label={ariaLabel}
        onClick={openPicker}
        onKeyDown={onKeyDown}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
      >
        <UploadCloud className={styles.dropIcon} aria-hidden="true" />
        <p className={styles.dropPrimary}>
          {multiple ? "Drag files here or tap to select" : "Drag a file here or tap to select"}
        </p>
        <p className={styles.dropSecondary}>
          {helperText ?? (maxSizeBytes ? `Max ${formatBytes(maxSizeBytes)} per file` : undefined)}
        </p>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          className={styles.input}
          accept={acceptString}
          multiple={multiple}
          disabled={disabled}
          onChange={onInputChange}
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      {issues.length > 0 && (
        <div className={styles.issues}>
          {issues.map((issue, index) => (
            <Alert
              key={`${issue.file.name}-${index}`}
              variant="error"
              icon={<FileWarning aria-hidden="true" />}
              title={issue.file.name}
              description={issue.reason}
              dismissible
              onDismiss={() => dismissIssue(index)}
              className={styles.issueAlert}
            />
          ))}
        </div>
      )}

      {selected.length > 0 && (
        <ul className={styles.fileList} aria-label="Selected files">
          {selected.map((file, index) => (
            <li key={`${file.name}-${index}`} className={styles.fileItem}>
              <span className={styles.fileMeta}>
                <span className={styles.fileName}>{file.name}</span>
                <span className={styles.fileSize}>{formatBytes(file.size)}</span>
              </span>
              <IconButton
                variant="ghost"
                size="sm"
                label={`Remove ${file.name}`}
                onClick={() => removeFile(index)}
                disabled={disabled}
                className={styles.removeButton}
              >
                <X aria-hidden="true" />
              </IconButton>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export { formatBytes };
