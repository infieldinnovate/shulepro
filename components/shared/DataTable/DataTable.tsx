"use client";

import { useMemo } from "react";
import type { ReactNode, MouseEvent } from "react";
import {
  useTable,
  flexRender,
  tableFeatures,
  createCoreRowModel,
  createSortedRowModel,
  createFilteredRowModel,
  createPaginatedRowModel,
  rowSortingFeature,
  rowPaginationFeature,
  columnVisibilityFeature,
  columnFilteringFeature,
  rowSelectionFeature,
} from "@tanstack/react-table";
import type {
  ColumnDef,
  RowData,
  SortingState,
  PaginationState,
  ColumnVisibilityState,
  RowSelectionState,
  OnChangeFn,
} from "@tanstack/react-table";
import clsx from "clsx";
import { Table } from "../../ui/Table";
import { Checkbox } from "../../ui/Checkbox";
import { Skeleton } from "../../ui/Skeleton";
import { EmptyState } from "../../ui/EmptyState";
import { Alert } from "../../ui/Alert";
import { DataTableColumnHeader } from "../DataTableColumnHeader";
import styles from "./DataTable.module.scss";

export type DataTableSortDir = "asc" | "desc";
export type DataTableSortState = SortingState;
export type DataTablePaginationState = PaginationState;
export type DataTableColumnVisibilityState = ColumnVisibilityState;
export type DataTableRowSelectionState = RowSelectionState;

export interface DataTableState {
  sorting?: SortingState;
  pagination?: PaginationState;
  columnVisibility?: ColumnVisibilityState;
  rowSelection?: RowSelectionState;
}

const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  columnVisibilityFeature,
  columnFilteringFeature,
  rowSelectionFeature,
  coreRowModel: createCoreRowModel(),
  sortedRowModel: createSortedRowModel(),
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
});

export type DataTableFeatures = typeof dataTableFeatures;

export interface ColumnMeta {
  align?: "start" | "center" | "end";
  numeric?: boolean;
  truncate?: boolean;
}

const DEFAULT_PAGE_SIZE = 10;

function makeOnChange<T>(
  current: T | undefined,
  onStateChange: ((next: DataTableState) => void) | undefined,
  key: keyof DataTableState,
): OnChangeFn<T> | undefined {
  if (!onStateChange) return undefined;
  return (updater) => {
    const nextValue =
      typeof updater === "function"
        ? (updater as (prev: T) => T)(current as T)
        : updater;
    onStateChange({ [key]: nextValue } as unknown as DataTableState);
  };
}

export interface DataTableProps<TData extends RowData> {
  data: ReadonlyArray<TData>;
  columns: ColumnDef<DataTableFeatures, TData, unknown>[];
  state?: DataTableState;
  onStateChange?: (next: DataTableState) => void;
  enableSorting?: boolean;
  enableColumnVisibility?: boolean;
  enableRowSelection?: boolean;
  loading?: boolean;
  loadingRows?: number;
  error?: ReactNode;
  emptyState?: ReactNode;
  onRowClick?: (row: TData, index: number) => void;
  getRowId?: (row: TData, index: number) => string;
  toolbar?: ReactNode;
  pagination?: ReactNode;
  stickyHeader?: boolean;
  zebra?: boolean;
  className?: string;
  caption?: ReactNode;
}

export function DataTable<TData extends RowData>({
  data,
  columns,
  state,
  onStateChange,
  enableSorting = true,
  enableColumnVisibility = true,
  enableRowSelection = false,
  loading = false,
  loadingRows = 5,
  error,
  emptyState,
  onRowClick,
  getRowId,
  toolbar,
  pagination,
  stickyHeader = true,
  zebra = false,
  className,
  caption,
}: DataTableProps<TData>) {
  const sorting = state?.sorting;
  const paginationState = state?.pagination ?? {
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  };
  const columnVisibility = state?.columnVisibility;
  const rowSelection = state?.rowSelection;

  const table = useTable<DataTableFeatures, TData>({
    features: dataTableFeatures,
    data,
    columns,
    state: {
      sorting,
      pagination: paginationState,
      columnVisibility,
      rowSelection,
    },
    enableSorting,
    enableHiding: enableColumnVisibility,
    enableRowSelection,
    getRowId,
    onSortingChange: makeOnChange(sorting, onStateChange, "sorting") as
      | OnChangeFn<SortingState>
      | undefined,
    onPaginationChange: makeOnChange(
      paginationState,
      onStateChange,
      "pagination",
    ) as OnChangeFn<PaginationState> | undefined,
    onColumnVisibilityChange: makeOnChange(
      columnVisibility,
      onStateChange,
      "columnVisibility",
    ) as OnChangeFn<ColumnVisibilityState> | undefined,
    onRowSelectionChange: makeOnChange(
      rowSelection,
      onStateChange,
      "rowSelection",
    ) as OnChangeFn<RowSelectionState> | undefined,
  });

  const visibleColumns = table.getVisibleLeafColumns();
  const headerGroups = table.getHeaderGroups();
  const leafHeaders =
    headerGroups.length > 0
      ? headerGroups[headerGroups.length - 1].headers
      : [];
  const rows = table.getRowModel().rows;

  const allPageSelected = table.getIsAllPageRowsSelected();
  const somePageSelected = table.getIsSomePageRowsSelected();
  const toggleAllHandler = table.getToggleAllPageRowsSelectedHandler();

  const colCount = visibleColumns.length + (enableRowSelection ? 1 : 0);

  const handleRowClick = (
    e: MouseEvent<HTMLTableRowElement>,
    row: (typeof rows)[number],
  ) => {
    if (!onRowClick) return;
    const target = e.target as HTMLElement;
    if (target.closest("button, a, input, [role='menu'], [role='menuitem']"))
      return;
    onRowClick(row.original, row.index);
  };

  const renderHeader = () => {
    const cells: ReactNode[] = [];

    if (enableRowSelection) {
      cells.push(
        <Table.Head
          key="__select"
          align="center"
          className={styles.selectHead}
        >
          <Checkbox
            checked={allPageSelected}
            indeterminate={somePageSelected && !allPageSelected}
            onChange={toggleAllHandler}
            aria-label="Select all rows on this page"
            className={styles.selectCheckbox}
          />
        </Table.Head>,
      );
    }

    leafHeaders.forEach((header) => {
      const col = header.column;
      const meta = (col.columnDef as { meta?: ColumnMeta }).meta;
      const sortDir = col.getIsSorted();
      const canSort = enableSorting && col.getCanSort();

      cells.push(
        <DataTableColumnHeader
          key={col.id}
          align={meta?.align}
          numeric={meta?.numeric}
          sortable={canSort}
          sortDir={sortDir || undefined}
          onSort={col.getToggleSortingHandler()}
        >
          {flexRender(col.columnDef.header, header.getContext())}
        </DataTableColumnHeader>,
      );
    });

    return <Table.Row>{cells}</Table.Row>;
  };

  const renderBody = () => {
    if (loading) {
      return (
        <Table.Body>
          {Array.from({ length: loadingRows }, (_, rowIdx) => (
            <Table.Row key={`skeleton-${rowIdx}`}>
              {Array.from({ length: colCount }, (_, colIdx) => (
                <Table.Cell key={`skeleton-${rowIdx}-${colIdx}`}>
                  <Skeleton
                    variant="text"
                    width={colIdx === 0 ? "60%" : "90%"}
                  />
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      );
    }

    if (error) {
      return (
        <Table.Body>
          <Table.Row>
            <Table.Cell colSpan={colCount} className={styles.stateCell}>
              <Alert variant="error" description={error} />
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      );
    }

    if (rows.length === 0) {
      return (
        <Table.Body>
          <Table.Row>
            <Table.Cell colSpan={colCount} className={styles.stateCell}>
              {emptyState ?? (
                <EmptyState
                  title="No results"
                  description="There is no data to display."
                />
              )}
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      );
    }

    return (
      <Table.Body>
        {rows.map((row) => {
          const selected = row.getIsSelected();
          const cells = row.getVisibleCells();
          return (
            <Table.Row
              key={row.id}
              selected={selected}
              onClick={
                onRowClick ? (e) => handleRowClick(e, row) : undefined
              }
              className={clsx(onRowClick && styles.clickableRow)}
            >
              {enableRowSelection && (
                <Table.Cell align="center" className={styles.selectCell}>
                  <Checkbox
                    checked={selected}
                    disabled={!row.getCanSelect()}
                    onChange={row.getToggleSelectedHandler()}
                    aria-label={`Select row ${row.index + 1}`}
                    className={styles.selectCheckbox}
                  />
                </Table.Cell>
              )}
              {cells.map((cell) => {
                const meta = (
                  cell.column.columnDef as { meta?: ColumnMeta }
                ).meta;
                return (
                  <Table.Cell
                    key={cell.column.id}
                    align={meta?.align}
                    numeric={meta?.numeric}
                    truncate={meta?.truncate}
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext(),
                    )}
                  </Table.Cell>
                );
              })}
            </Table.Row>
          );
        })}
      </Table.Body>
    );
  };

  const tableEl = useMemo(
    () => (
      <Table stickyHeader={stickyHeader} zebra={zebra} caption={caption}>
        <Table.Header>{renderHeader()}</Table.Header>
        {renderBody()}
      </Table>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      loading,
      loadingRows,
      error,
      emptyState,
      rows.length,
      visibleColumns.length,
      leafHeaders.length,
      colCount,
      enableRowSelection,
      allPageSelected,
      somePageSelected,
      onRowClick,
      zebra,
      stickyHeader,
      caption,
      table,
    ],
  );

  return (
    <div className={clsx(styles.wrapper, className)}>
      {toolbar && <div className={styles.toolbar}>{toolbar}</div>}
      {tableEl}
      {pagination && <div className={styles.pagination}>{pagination}</div>}
    </div>
  );
}
