"use client";

import type { ReactNode } from "react";
import { ChevronLeft, ChevronDown, ChevronRight } from "lucide-react";
import clsx from "clsx";
import styles from "./Pagination.module.scss";

export interface PaginationProps {
  /** 1-based current page. */
  currentPage: number;
  /** Total number of pages. */
  totalPages: number;
  /** Total number of items (for summary text). */
  totalItems?: number;
  /** Current page size. */
  pageSize?: number;
  /** Available page-size options for the selector. */
  pageSizeOptions?: number[];
  /** Callback when the current page changes. */
  onPageChange: (page: number) => void;
  /** Callback when the page size changes. */
  onPageSizeChange?: (size: number) => void;
  /** Max number of page buttons shown around the edges (default 1). */
  siblingCount?: number;
  /** Accessible label for the pagination region. */
  ariaLabel?: string;
  className?: string;
}

type PageSlot = number | "ellipsis";

function buildPageSlots(
  current: number,
  total: number,
  siblingCount: number,
): PageSlot[] {
  if (total <= 0) return [];
  if (total <= 5 + siblingCount * 2) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const slots: PageSlot[] = [1];

  const leftStart = Math.max(2, current - siblingCount);
  const rightEnd = Math.min(total - 1, current + siblingCount);

  if (leftStart > 2) slots.push("ellipsis");
  for (let p = leftStart; p <= rightEnd; p += 1) slots.push(p);
  if (rightEnd < total - 1) slots.push("ellipsis");

  slots.push(total);
  return slots;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
  siblingCount = 1,
  ariaLabel = "Pagination",
  className,
}: PaginationProps) {
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;
  const slots = buildPageSlots(currentPage, totalPages, siblingCount);

  const goTo = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };

  const showPageSize = Boolean(
    onPageSizeChange && pageSizeOptions && pageSizeOptions.length > 0,
  );
  const showSummary = typeof totalItems === "number";

  const summaryText = showSummary
    ? `${Math.min((currentPage - 1) * (pageSize ?? 1) + 1, totalItems!)}–${Math.min(currentPage * (pageSize ?? 1), totalItems!)} of ${totalItems}`
    : `Page ${currentPage} of ${totalPages}`;

  const navButton = (
    page: number,
    disabled: boolean,
    direction: "prev" | "next",
    label: string,
    icon: ReactNode,
  ) => (
    <button
      type="button"
      className={styles.navButton}
      onClick={() => goTo(page)}
      disabled={disabled}
      aria-label={label}
    >
      {direction === "prev" ? icon : <span className={styles.navButtonLabel}>{label}</span>}
      {direction === "prev" ? <span className={styles.navButtonLabel}>{label}</span> : icon}
    </button>
  );

  return (
    <nav
      aria-label={ariaLabel}
      className={clsx(styles.pagination, className)}
    >
      <div className={styles.left}>
        {showPageSize && (
          <span className={styles.pageSize}>
            <span className={styles.pageSizeLabel}>Rows per page:</span>
            <span className={styles.pageSizeSelectWrap}>
              <select
                className={styles.pageSizeSelect}
                value={pageSize}
                aria-label="Rows per page"
                onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
              >
                {pageSizeOptions!.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDown className={styles.pageSizeChevron} aria-hidden="true" />
            </span>
          </span>
        )}
        {showSummary && <span className={styles.summary}>{summaryText}</span>}
      </div>

      <div className={styles.right}>
        {navButton(
          currentPage - 1,
          !canPrev,
          "prev",
          "Previous page",
          <ChevronLeft aria-hidden="true" />,
        )}

        <ol className={styles.pages}>
          {slots.map((slot, idx) => {
            if (slot === "ellipsis") {
              return (
                <li
                  key={`ellipsis-${idx}`}
                  className={styles.ellipsis}
                  aria-hidden="true"
                >
                  …
                </li>
              );
            }
            const isCurrent = slot === currentPage;
            return (
              <li key={slot}>
                <button
                  type="button"
                  className={clsx(styles.pageButton, isCurrent && styles.selected)}
                  onClick={() => goTo(slot)}
                  aria-current={isCurrent ? "page" : undefined}
                  aria-label={`Page ${slot}`}
                >
                  {slot}
                </button>
              </li>
            );
          })}
        </ol>

        <span className={styles.compactSummary}>
          Page {currentPage} of {totalPages}
        </span>

        {navButton(
          currentPage + 1,
          !canNext,
          "next",
          "Next page",
          <ChevronRight aria-hidden="true" />,
        )}
      </div>
    </nav>
  );
}
