"use client";

import type { ReactNode } from "react";
import clsx from "clsx";
import { FileUploader } from "@/components/shared/FileUploader";
import { AttachmentList } from "@/components/shared/AttachmentList";
import type { Attachment } from "@/components/shared/AttachmentList";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import type { EvidenceItem } from "@/components/features/assessment/types";
import styles from "./EvidenceUploader.module.scss";

export interface EvidenceUploaderProps {
  /** Already-collected evidence items. */
  evidenceItems: EvidenceItem[];
  /** Called with valid files — does NOT store or persist them. */
  onFilesSelected: (files: File[]) => void;
  /** Called when the user removes an existing evidence item. */
  onRemoveEvidence?: (item: EvidenceItem) => void;
  /** Accepted MIME types or extensions. */
  accept?: string[];
  maxFiles?: number;
  maxSizeBytes?: number;
  loading?: boolean;
  error?: ReactNode;
  disabled?: boolean;
  className?: string;
}

function evidenceToAttachments(items: EvidenceItem[]): Attachment[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    size: item.size ?? 0,
    type: item.type,
    url: item.url,
    uploadedAt: item.uploadedAt
      ? typeof item.uploadedAt === "string"
        ? item.uploadedAt
        : item.uploadedAt.getTime()
      : undefined,
    uploadedBy: item.uploadedBy,
  }));
}

export function EvidenceUploader({
  evidenceItems,
  onFilesSelected,
  onRemoveEvidence,
  accept,
  maxFiles,
  maxSizeBytes,
  loading = false,
  error,
  disabled = false,
  className,
}: EvidenceUploaderProps) {
  if (loading) {
    return (
      <div className={clsx(styles.container, className)}>
        <div className={styles.loadingState}>
          <Spinner size="md" label="Loading evidence uploader" />
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(styles.container, className)}>
      {error && (
        <Alert
          variant="error"
          title="Unable to load evidence"
          description={error}
        />
      )}

      <FileUploader
        onFilesSelected={onFilesSelected}
        accept={accept}
        maxFiles={maxFiles}
        maxSizeBytes={maxSizeBytes}
        disabled={disabled}
        multiple
        helperText="Upload evidence files — photos, documents, recordings, or other artifacts."
        ariaLabel="Upload assessment evidence"
        className={styles.uploader}
      />

      <div className={styles.evidenceSection}>
        <h4 className={styles.sectionTitle}>Collected evidence</h4>
        {evidenceItems.length > 0 ? (
          <AttachmentList
            attachments={evidenceToAttachments(evidenceItems)}
            onRemove={
              onRemoveEvidence
                ? (attachment) => {
                    const item = evidenceItems.find(
                      (e) => e.id === attachment.id,
                    );
                    if (item) onRemoveEvidence(item);
                  }
                : undefined
            }
            emptyText="No evidence collected"
            ariaLabel="Assessment evidence"
          />
        ) : (
          <EmptyState
            title="No evidence collected"
            description="Files added above will appear here once collected."
            className={styles.empty}
          />
        )}
      </div>
    </div>
  );
}
