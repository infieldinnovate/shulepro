"use client";

import { Pagination } from "@/components/ui/Pagination";
import styles from "./DataTablePagination.module.scss";

export interface DataTablePaginationProps {
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  rowCount?: number;
  pageSizeOptions?: number[];
  onPageChange?: (pageIndex: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  ariaLabel?: string;
  className?: string;
}

export function DataTablePagination({
  pageIndex,
  pageSize,
  pageCount,
  rowCount,
  pageSizeOptions = [10, 20, 50, 100],
  onPageChange,
  onPageSizeChange,
  ariaLabel = "Table pagination",
  className,
}: DataTablePaginationProps) {
  return (
    <div className={styles.pagination}>
      <Pagination
        currentPage={pageIndex + 1}
        totalPages={Math.max(pageCount, 1)}
        totalItems={rowCount}
        pageSize={pageSize}
        pageSizeOptions={pageSizeOptions}
        onPageChange={(page) => onPageChange?.(page - 1)}
        onPageSizeChange={onPageSizeChange}
        ariaLabel={ariaLabel}
        className={className}
      />
    </div>
  );
}
