"use client";

import { useState, useMemo, useCallback } from "react";
import type { ReactNode } from "react";
import type { ColumnDef, RowData } from "@tanstack/react-table";
import { ClipboardList } from "lucide-react";
import clsx from "clsx";
import { Card } from "../../../ui/Card";
import { Badge } from "../../../ui/Badge";
import { Select } from "../../../ui/Select";
import type { SelectOption } from "../../../ui/Select";
import { Spinner } from "../../../ui/Spinner";
import { Alert } from "../../../ui/Alert";
import { EmptyState } from "../../../ui/EmptyState";
import { DataTable } from "../../../shared/DataTable";
import type {
  DataTableState,
  DataTableSortState,
  DataTablePaginationState,
  DataTableRowSelectionState,
  DataTableFeatures,
} from "../../../shared/DataTable";
import type { ColumnMeta } from "../../../shared/DataTable/DataTable";
import { DataTableToolbar } from "../../../shared/DataTableToolbar";
import { DataTablePagination } from "../../../shared/DataTablePagination";
import { BulkActionBar } from "../../../shared/BulkActionBar";
import type { BulkAction } from "../../../shared/BulkActionBar";
import { SearchInput } from "../../../shared/SearchInput";
import type {
  ParticipationRecord,
  ParticipationStatusOption,
  ParticipationColumn,
} from "../types";
import styles from "./ParticipationRegister.module.scss";

export interface ParticipationRegisterProps {
  /** Participant records to display. */
  records: ParticipationRecord[];
  /** Configurable participation status options. */
  statusOptions: ParticipationStatusOption[];
  /** Optional extra columns (beyond name, status, notes). */
  extraColumns?: ParticipationColumn[];
  /** Optional bulk actions for selected rows. */
  bulkActions?: BulkAction[];
  /** Optional title for the register. */
  title?: string;
  /** Optional description shown under the title. */
  description?: string;
  /** Called when a participant's status is changed. */
  onStatusChange?: (recordId: string, newStatus: string) => void;
  loading?: boolean;
  error?: string;
  /** Optional content rendered below the register. */
  children?: ReactNode;
  className?: string;
}

function statusToBadge(
  statusValue: string,
  options: ParticipationStatusOption[],
) {
  const option = options.find((o) => o.value === statusValue);
  if (!option) return <Badge variant="neutral" size="sm">{statusValue}</Badge>;
  return (
    <Badge variant={option.variant ?? "neutral"} size="sm">
      {option.label}
    </Badge>
  );
}

function statusToOptions(
  options: ParticipationStatusOption[],
): SelectOption[] {
  return options.map((o) => ({ value: o.value, label: o.label }));
}

type RegisterRow = RowData & {
  id: string;
  name: string;
  ref?: string;
  status: string;
  notes?: string;
  [key: string]: unknown;
};

export function ParticipationRegister({
  records,
  statusOptions,
  extraColumns = [],
  bulkActions = [],
  title = "Participation register",
  description,
  onStatusChange,
  loading = false,
  error,
  children,
  className,
}: ParticipationRegisterProps) {
  const [sorting, setSorting] = useState<DataTableSortState>([]);
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowSelection, setRowSelection] =
    useState<DataTableRowSelectionState>({});
  const [search, setSearch] = useState("");

  const statusSelectOptions = useMemo(
    () => statusToOptions(statusOptions),
    [statusOptions],
  );

  const tableState: DataTableState = useMemo(
    () => ({
      sorting,
      pagination,
      rowSelection,
    }),
    [sorting, pagination, rowSelection],
  );

  const handleStateChange = useCallback((next: DataTableState) => {
    if (next.sorting !== undefined) setSorting(next.sorting);
    if (next.pagination !== undefined) setPagination(next.pagination);
    if (next.rowSelection !== undefined) setRowSelection(next.rowSelection);
  }, []);

  const filteredRecords = useMemo(() => {
    if (!search.trim()) return records;
    const q = search.toLowerCase();
    return records.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.ref?.toLowerCase().includes(q) ?? false),
    );
  }, [records, search]);

  const columns = useMemo(() => {
    const nameCol: ColumnDef<DataTableFeatures, RegisterRow, unknown> = {
      id: "name",
      header: "Participant",
      accessorKey: "name",
      cell: ({ row }) => (
        <div className={styles.participantCell}>
          <span className={styles.participantName}>{row.original.name}</span>
          {row.original.ref && (
            <span className={styles.participantRef}>{row.original.ref}</span>
          )}
        </div>
      ),
      meta: { truncate: true } as ColumnMeta,
    };

    const statusCol: ColumnDef<DataTableFeatures, RegisterRow, unknown> = {
      id: "status",
      header: "Status",
      accessorKey: "status",
      enableSorting: false,
      cell: ({ row }) => {
        if (onStatusChange) {
          return (
            <Select
              options={statusSelectOptions}
              value={row.original.status}
              selectSize="sm"
              onChange={(e) =>
                onStatusChange(row.original.id, e.target.value)
              }
              aria-label={`Status for ${row.original.name}`}
            />
          );
        }
        return statusToBadge(row.original.status, statusOptions);
      },
      meta: {} as ColumnMeta,
    };

    const notesCol: ColumnDef<DataTableFeatures, RegisterRow, unknown> = {
      id: "notes",
      header: "Notes",
      accessorKey: "notes",
      enableSorting: false,
      cell: ({ row }) =>
        row.original.notes ? (
          <span className={styles.notesText}>{row.original.notes}</span>
        ) : (
          <span className={styles.notesEmpty}>—</span>
        ),
      meta: { truncate: true } as ColumnMeta,
    };

    const extraCols: ColumnDef<
      DataTableFeatures,
      RegisterRow,
      unknown
    >[] = extraColumns.map((col) => ({
      id: col.id,
      header: col.label,
      accessorKey: col.id,
      enableSorting: false,
      cell: ({ row }) => {
        const val = row.original[col.id];
        if (val == null || val === "") return <span className={styles.notesEmpty}>—</span>;
        return <span>{String(val)}</span>;
      },
      meta: { truncate: true } as ColumnMeta,
    }));

    return [nameCol, statusCol, ...extraCols, notesCol];
  }, [extraColumns, onStatusChange, statusOptions, statusSelectOptions]);

  if (loading) {
    return (
      <div className={clsx(styles.container, className)}>
        <div className={styles.loadingState}>
          <Spinner size="md" label="Loading participation register" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={clsx(styles.container, className)}>
        <Alert
          variant="error"
          title="Unable to load participation register"
          description={error}
        />
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className={clsx(styles.container, className)}>
        <EmptyState
          icon={<ClipboardList aria-hidden="true" />}
          title="No participants"
          description="Participant records will appear here once the register is populated."
        />
      </div>
    );
  }

  const selectedCount = Object.values(rowSelection).filter(Boolean).length;
  const showBulkBar = selectedCount > 0 && bulkActions.length > 0;
  const pageCount = Math.ceil(filteredRecords.length / pagination.pageSize);

  return (
    <div className={clsx(styles.container, className)}>
      {(title || description) && (
        <div className={styles.header}>
          {title && <h3 className={styles.title}>{title}</h3>}
          {description && (
            <p className={styles.description}>{description}</p>
          )}
        </div>
      )}

      {showBulkBar && (
        <BulkActionBar
          selectedCount={selectedCount}
          totalCount={filteredRecords.length}
          onClearSelection={() => setRowSelection({})}
          actions={bulkActions}
          ariaLabel="Participation register bulk actions"
        />
      )}

      <Card padded={false} className={styles.tableCard}>
        <DataTable
          data={filteredRecords as RegisterRow[]}
          columns={columns}
          state={tableState}
          onStateChange={handleStateChange}
          enableRowSelection={bulkActions.length > 0}
          getRowId={(row) => row.id}
          toolbar={
            <DataTableToolbar
              filters={
                <SearchInput
                  value={search}
                  onValueChange={setSearch}
                  placeholder="Search participants..."
                  ariaLabel="Search participants"
                />
              }
            />
          }
          pagination={
            <DataTablePagination
              pageIndex={pagination.pageIndex}
              pageSize={pagination.pageSize}
              pageCount={pageCount}
              rowCount={filteredRecords.length}
              onPageChange={(idx) =>
                setPagination((prev) => ({ ...prev, pageIndex: idx }))
              }
              onPageSizeChange={(size) =>
                setPagination({ pageIndex: 0, pageSize: size })
              }
              ariaLabel="Participation register pagination"
            />
          }
          zebra
        />
      </Card>

      {children}
    </div>
  );
}
