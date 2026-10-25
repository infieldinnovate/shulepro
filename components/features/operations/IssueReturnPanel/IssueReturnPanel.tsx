"use client";

import { BookUp, BookDown } from "lucide-react";
import clsx from "clsx";
import { FormSection } from "@/components/shared/FormSection";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import type {
  LibraryItem,
  LibraryBorrower,
  LibraryIssueRecord,
} from "@/components/features/operations/types";
import { formatDateMedium } from "@/lib/formatTime";
import styles from "./IssueReturnPanel.module.scss";

export interface IssueReturnPanelProps {
  item?: LibraryItem | null;
  borrower?: LibraryBorrower | null;
  issueRecord?: LibraryIssueRecord | null;
  onIssue?: () => void;
  onReturn?: () => void;
  loading?: boolean;
  error?: string;
  className?: string;
}

function formatDate(d: Date | string | undefined): string {
  const formatted = formatDateMedium(d);
  return formatted || "—";
}

export function IssueReturnPanel({
  item,
  borrower,
  issueRecord,
  onIssue,
  onReturn,
  loading = false,
  error,
  className,
}: IssueReturnPanelProps) {
  const isIssued = issueRecord?.isIssued ?? false;

  return (
    <div className={clsx(styles.container, className)}>
      {error && (
        <Alert variant="error" title="Action failed" description={error} />
      )}

      <FormSection
        title="Item details"
        description={isIssued ? "Currently issued." : "Available for issue."}
      >
        <div className={styles.fieldGrid}>
          <div className={styles.fieldItem}>
            <dt className={styles.fieldLabel}>Title</dt>
            <dd className={styles.fieldValue}>{item?.title ?? "—"}</dd>
          </div>
          <div className={styles.fieldItem}>
            <dt className={styles.fieldLabel}>Author</dt>
            <dd className={styles.fieldValue}>{item?.author ?? "—"}</dd>
          </div>
          <div className={styles.fieldItem}>
            <dt className={styles.fieldLabel}>Available copies</dt>
            <dd className={styles.fieldValue}>
              {item ? `${item.availableCopies} / ${item.totalCopies}` : "—"}
            </dd>
          </div>
        </div>
      </FormSection>

      {isIssued && issueRecord && (
        <FormSection title="Issue details">
          <div className={styles.fieldGrid}>
            <div className={styles.fieldItem}>
              <dt className={styles.fieldLabel}>Borrower</dt>
              <dd className={styles.fieldValue}>
                {issueRecord.borrowerName || borrower?.name || "—"}
              </dd>
            </div>
            <div className={styles.fieldItem}>
              <dt className={styles.fieldLabel}>Issue date</dt>
              <dd className={styles.fieldValue}>
                {formatDate(issueRecord.issueDate)}
              </dd>
            </div>
            <div className={styles.fieldItem}>
              <dt className={styles.fieldLabel}>Due date</dt>
              <dd className={styles.fieldValue}>
                {formatDate(issueRecord.dueDate)}
              </dd>
            </div>
            <div className={styles.fieldItem}>
              <dt className={styles.fieldLabel}>Return date</dt>
              <dd className={styles.fieldValue}>
                {formatDate(issueRecord.returnDate)}
              </dd>
            </div>
          </div>
        </FormSection>
      )}

      <div className={styles.actions}>
        {isIssued ? (
          <Button
            type="button"
            variant="outline"
            onClick={onReturn}
            loading={loading}
            leftIcon={<BookDown aria-hidden="true" />}
          >
            Return item
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onIssue}
            loading={loading}
            leftIcon={<BookUp aria-hidden="true" />}
          >
            Issue item
          </Button>
        )}
      </div>
    </div>
  );
}
