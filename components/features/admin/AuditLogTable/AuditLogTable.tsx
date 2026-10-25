"use client";

import { useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { format, isValid, parseISO } from "date-fns";
import { ScrollText } from "lucide-react";
import clsx from "clsx";
import { DataTable } from "@/components/shared/DataTable";
import type {
  DataTableState,
  DataTableSortState,
  DataTablePaginationState,
  DataTableColumnVisibilityState,
  DataTableFeatures,
} from "@/components/shared/DataTable";
import { DataTablePagination } from "@/components/shared/DataTablePagination";
import { Badge } from "@/components/ui/Badge";
import type { BadgeVariant } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import type {
  AuditLogEvent,
  AuditLogSeverity,
} from "@/components/features/admin/types";
import styles from "./AuditLogTable.module.scss";

export interface AuditLogTableProps {
  events: AuditLogEvent[];
  /** Controlled sorting state (column id + direction). */
  sorting?: DataTableSortState;
  /** Controlled pagination state. */
  pagination?: DataTablePaginationState;
  /** Controlled column visibility state (for hiding columns on narrow screens). */
  columnVisibility?: DataTableColumnVisibilityState;
  /** Emitted when sorting, pagination, or column visibility changes. */
  onStateChange?: (next: DataTableState) => void;
  /** Total row count for pagination (use when events are already paginated externally). */
  totalCount?: number;
  /** Optional drill-down callback when a row is clicked. */
  onRowClick?: (event: AuditLogEvent) => void;
  /** Loading state. */
  loading?: boolean;
  /** Error message to display instead of rows. */
  error?: ReactNode;
  /** When true, pagination controls are shown. */
  enablePagination?: boolean;
  /** Page size options for the pagination control. */
  pageSizeOptions?: number[];
  className?: string;
}

/** Column ids used for sorting and column visibility. */
export const AUDIT_LOG_COLUMN_IDS = [
  "timestamp",
  "actorName",
  "actionType",
  "resource",
  "description",
  "severity",
] as const;

export type AuditLogColumnId = (typeof AUDIT_LOG_COLUMN_IDS)[number];

/**
 * Default column visibility: hides "resource" and "description" on
 * narrow screens to keep the table readable. The caller can override
 * via the `columnVisibility` prop.
 */
export const DEFAULT_COLUMN_VISIBILITY: DataTableColumnVisibilityState = {
  resource: false,
  description: false,
};

function formatTimestamp(value: string): string {
  if (!value) return "—";
  const date = parseISO(value);
  return isValid(date) ? format(date, "MMM d, yyyy HH:mm") : "—";
}

function severityVariant(severity: AuditLogSeverity | undefined): BadgeVariant | null {
  if (!severity) return null;
  const s = severity.toLowerCase();
  if (s.includes("critical") || s.includes("error") || s.includes("high")) {
    return "error";
  }
  if (s.includes("warning") || s.includes("medium")) {
    return "warning";
  }
  if (s.includes("info") || s.includes("low")) {
    return "info";
  }
  return "neutral";
}

export function AuditLogTable({
  events,
  sorting,
  pagination,
  columnVisibility,
  onStateChange,
  totalCount,
  onRowClick,
  loading = false,
  error,
  enablePagination = true,
  pageSizeOptions,
  className,
}: AuditLogTableProps) {
  const handleRowClick = useCallback(
    (row: AuditLogEvent) => {
      onRowClick?.(row);
    },
    [onRowClick],
  );

  const columns = useMemo<
    ColumnDef<DataTableFeatures, AuditLogEvent, unknown>[]
  >(
    () => [
      {
        id: "timestamp",
        accessorKey: "timestamp",
        header: "Timestamp",
        cell: ({ getValue }) => (
          <span className={styles.timestamp}>
            {formatTimestamp(getValue<string>() ?? "")}
          </span>
        ),
        sortingFn: "datetime",
        meta: { truncate: true },
      },
      {
        id: "actorName",
        accessorKey: "actorName",
        header: "Actor",
        cell: ({ getValue }) => (
          <span className={styles.actor}>{getValue<string>() || "—"}</span>
        ),
        meta: { truncate: true },
      },
      {
        id: "actionType",
        accessorKey: "actionType",
        header: "Action",
        cell: ({ getValue }) => (
          <Badge variant="neutral" size="sm">
            {getValue<string>() || "—"}
          </Badge>
        ),
        enableSorting: false,
        meta: { truncate: true },
      },
      {
        id: "resource",
        accessorKey: "resource",
        header: "Resource",
        cell: ({ row }) => (
          <span className={styles.resource}>
            {row.original.resource || "—"}
            {row.original.resourceId && (
              <span className={styles.resourceId}>
                {" "}
                #{row.original.resourceId}
              </span>
            )}
          </span>
        ),
        enableSorting: false,
        meta: { truncate: true },
      },
      {
        id: "description",
        accessorKey: "description",
        header: "Description",
        cell: ({ getValue }) => (
          <span className={styles.description}>
            {getValue<string>() || "—"}
          </span>
        ),
        enableSorting: false,
        meta: { truncate: true },
      },
      {
        id: "severity",
        accessorKey: "severity",
        header: "Severity",
        cell: ({ getValue }) => {
          const severity = getValue<AuditLogSeverity | undefined>();
          const variant = severityVariant(severity);
          if (!variant) return <span className={styles.muted}>—</span>;
          return (
            <Badge variant={variant} size="sm" dot>
              {severity}
            </Badge>
          );
        },
        enableSorting: false,
      },
    ],
    [],
  );

  const state: DataTableState = {
    sorting,
    pagination,
    columnVisibility,
  };

  const emptyState = (
    <EmptyState
      icon={<ScrollText aria-hidden="true" />}
      title="No audit events"
      description="There are no audit log events to display."
    />
  );

  const effectivePageSize = pagination?.pageSize ?? 10;
  const effectivePageIndex = pagination?.pageIndex ?? 0;
  const dataLength = totalCount ?? events.length;
  const currentPagination: DataTablePaginationState = {
    pageIndex: effectivePageIndex,
    pageSize: effectivePageSize,
  };

  return (
    <div className={clsx(styles.container, className)}>
      <DataTable<AuditLogEvent>
        data={events}
        columns={columns}
        state={state}
        onStateChange={onStateChange}
        enableSorting={true}
        enableColumnVisibility={true}
        loading={loading}
        error={error}
        emptyState={emptyState}
        onRowClick={onRowClick ? handleRowClick : undefined}
        getRowId={(row) => row.id}
        zebra
        stickyHeader
      />
      {enablePagination && onStateChange && (
        <DataTablePagination
          pageIndex={effectivePageIndex}
          pageSize={effectivePageSize}
          pageCount={Math.max(Math.ceil(dataLength / effectivePageSize), 1)}
          rowCount={dataLength}
          pageSizeOptions={pageSizeOptions}
          onPageChange={(pageIndex) =>
            onStateChange({ pagination: { ...currentPagination, pageIndex } })
          }
          onPageSizeChange={(pageSize) =>
            onStateChange({
              pagination: { pageIndex: 0, pageSize },
            })
          }
          ariaLabel="Audit log pagination"
        />
      )}
    </div>
  );
}
