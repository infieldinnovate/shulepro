"use client";

import type { ReactNode } from "react";
import {
  File as FileIcon,
  FileText,
  FileImage,
  FileSpreadsheet,
  FileArchive,
  Download,
  Trash2,
  Paperclip,
} from "lucide-react";
import clsx from "clsx";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconButton } from "@/components/ui/Button/IconButton";
import { formatAbsolute } from "@/lib/formatTime";
import { formatBytes } from "@/components/shared/FileUploader";
import styles from "./AttachmentList.module.scss";

export interface Attachment {
  id: string;
  name: string;
  size: number;
  /** MIME type, used to pick a representative icon. */
  type?: string;
  /** Optional URL for download/preview. */
  url?: string;
  /** Epoch ms or ISO string. */
  uploadedAt?: number | string;
  uploadedBy?: ReactNode;
}

export interface AttachmentListProps {
  attachments: Attachment[];
  onDownload?: (attachment: Attachment) => void;
  onRemove?: (attachment: Attachment) => void;
  emptyText?: ReactNode;
  emptyDescription?: ReactNode;
  ariaLabel?: string;
  className?: string;
}

function iconForType(type?: string): ReactNode {
  if (!type) return <FileIcon aria-hidden="true" />;
  const t = type.toLowerCase();
  if (t.startsWith("image/")) return <FileImage aria-hidden="true" />;
  if (t.startsWith("text/") || t.includes("pdf") || t.includes("word") || t.includes("document"))
    return <FileText aria-hidden="true" />;
  if (t.includes("sheet") || t.includes("excel") || t.includes("csv")) return <FileSpreadsheet aria-hidden="true" />;
  if (t.includes("zip") || t.includes("compressed") || t.includes("archive"))
    return <FileArchive aria-hidden="true" />;
  return <FileIcon aria-hidden="true" />;
}

export function AttachmentList({
  attachments,
  onDownload,
  onRemove,
  emptyText = "No attachments",
  emptyDescription = "Files added to this record will appear here.",
  ariaLabel = "Attachments",
  className,
}: AttachmentListProps) {
  if (attachments.length === 0) {
    return (
      <div className={clsx(styles.container, className)}>
        <EmptyState
          icon={<Paperclip aria-hidden="true" />}
          title={emptyText}
          description={emptyDescription}
          className={styles.empty}
        />
      </div>
    );
  }

  return (
    <ul className={clsx(styles.container, styles.list, className)} aria-label={ariaLabel}>
      {attachments.map((attachment) => {
        const downloadable = Boolean(onDownload || attachment.url);
        const removable = Boolean(onRemove);
        return (
          <li key={attachment.id} className={styles.item}>
            <span className={styles.icon} aria-hidden="true">
              {iconForType(attachment.type)}
            </span>
            <div className={styles.body}>
              <span className={styles.name}>{attachment.name}</span>
              <span className={styles.meta}>
                <span className={styles.metaItem}>{formatBytes(attachment.size)}</span>
                {attachment.uploadedAt && (
                  <span className={styles.metaItem}>
                    <time
                      dateTime={
                        typeof attachment.uploadedAt === "string"
                          ? attachment.uploadedAt
                          : new Date(attachment.uploadedAt).toISOString()
                      }
                      title={formatAbsolute(attachment.uploadedAt)}
                    >
                      {formatAbsolute(attachment.uploadedAt)}
                    </time>
                  </span>
                )}
                {attachment.uploadedBy && (
                  <span className={styles.metaItem}>by {attachment.uploadedBy}</span>
                )}
              </span>
            </div>
            {(downloadable || removable) && (
              <div className={styles.actions}>
                {downloadable && (
                  <IconButton
                    variant="ghost"
                    size="sm"
                    label={`Download ${attachment.name}`}
                    onClick={() => onDownload?.(attachment)}
                  >
                    <Download aria-hidden="true" />
                  </IconButton>
                )}
                {removable && (
                  <IconButton
                    variant="ghost"
                    size="sm"
                    label={`Remove ${attachment.name}`}
                    onClick={() => onRemove?.(attachment)}
                  >
                    <Trash2 aria-hidden="true" />
                  </IconButton>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
