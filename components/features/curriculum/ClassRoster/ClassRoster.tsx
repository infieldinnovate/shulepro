"use client";

import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import clsx from "clsx";
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
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Table } from "../../../ui/Table";
import { Avatar } from "../../../ui/Avatar";
import { Badge } from "../../../ui/Badge";
import { Spinner } from "../../../ui/Spinner";
import { Alert } from "../../../ui/Alert";
import { EmptyState } from "../../../ui/EmptyState";
import { SearchInput } from "../../../shared/SearchInput";
import { DataTablePagination } from "../../../shared/DataTablePagination";
import type { ClassRosterEntry } from "../types";
import styles from "./ClassRoster.module.scss";

export interface ClassRosterColumn {
  id: string;
  header: ReactNode;
  /** Render the cell content for a given entry. */
  cell: (entry: ClassRosterEntry) => ReactNode;
  /** Whether this column can be sorted. */
  sortable?: boolean;
  /** Width hint (CSS value). */
  width?: string;
  /** Hide this column on narrow screens. */
  hideOnMobile?: boolean;
}

export interface ClassRosterProps {
  entries: ClassRosterEntry[];
  /** Configurable columns. If omitted, default columns are used. */
  columns?: ClassRosterColumn[];
  loading?: boolean;
  error?: string;
  empty?: boolean;
  onRowClick?: (entry: ClassRosterEntry) => void;
  /** Slot rendered at the end of each row (e.g. action buttons). */
  rowActions?: (entry: ClassRosterEntry) => ReactNode;
  /** Show the built-in search input. */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Accessible label for the table. */
  ariaLabel?: string;
  /** Page size for pagination. */
  pageSize?: number;
  className?: string;
}

const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  columnVisibilityFeature,
  columnFilteringFeature,
  coreRowModel: createCoreRowModel(),
  sortedRowModel: createSortedRowModel(),
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
});

function learnerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const DEFAULT_COLUMNS: ClassRosterColumn[] = [
  {
    id: "learner",
    header: "Learner",
    sortable: true,
    cell: (entry) => (
      <span className={styles.learnerCell}>
        <Avatar
          src={entry.avatarSrc}
          name={entry.initials ?? learnerInitials(entry.name)}
          alt={entry.name}
          size="sm"
        />
        <span className={styles.learnerName}>{entry.name}</span>
      </span>
    ),
  },
  {
    id: "identifier",
    header: "ID",
    sortable: true,
    hideOnMobile: true,
    cell: (entry) =>
      entry.identifier ? (
        <span className={styles.identifier}>{entry.identifier}</span>
      ) : null,
  },
  {
    id: "gender",
    header: "Gender",
    hideOnMobile: true,
    cell: (entry) =>
      entry.gender ? (
        <span className={styles.gender}>{entry.gender}</span>
      ) : null,
  },
  {
    id: "status",
    header: "Status",
    cell: (entry) => {
      if (!entry.enrolmentStatus) return null;
      const { status, variant = "neutral", label } = entry.enrolmentStatus;
      return (
        <Badge variant={variant} dot>
          {label ?? status}
        </Badge>
      );
    },
  },
];

export function ClassRoster({
  entries,
  columns,
  loading = false,
  error,
  empty = false,
  onRowClick,
  rowActions,
  searchable = true,
  searchPlaceholder = "Search learners\u2026",
  ariaLabel = "Class roster",
  pageSize = 10,
  className,
}: ClassRosterProps) {
  const [query, setQuery] = useState("");
  const [pageIndex, setPageIndex] = useState(0);

  const cols = columns ?? DEFAULT_COLUMNS;

  // Build the action column if rowActions is provided
  const allColumns = useMemo(() => {
    const list = [...cols];
    if (rowActions) {
      list.push({
        id: "__actions",
        header: "",
        cell: (entry) => rowActions(entry),
      });
    }
    return list;
  }, [cols, rowActions]);

  // Filter entries by search query
  const filteredEntries = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return entries;
    return entries.filter((e) => {
      const name = e.name.toLowerCase();
      const ident = e.identifier?.toLowerCase();
      const altIds = e.alternateIds?.map((a) => a.value.toLowerCase());
      return (
        name.includes(normalized) ||
        (ident != null && ident.includes(normalized)) ||
        (altIds != null && altIds.some((v) => v.includes(normalized)))
      );
    });
  }, [entries, query]);

  // Build TanStack column defs
  const tanstackColumns = useMemo<ColumnDef<typeof dataTableFeatures, ClassRosterEntry, unknown>[]>(() => {
    return allColumns.map((col) => ({
      id: col.id,
      accessorFn: (row) => {
        if (col.id === "learner") return row.name;
        if (col.id === "identifier") return row.identifier ?? "";
        if (col.id === "gender") return row.gender ?? "";
        if (col.id === "status") return row.enrolmentStatus?.status ?? "";
        return undefined;
      },
      header: () => col.header,
      cell: ({ row }) => col.cell(row.original),
      enableSorting: col.sortable ?? false,
      meta: { width: col.width, hideOnMobile: col.hideOnMobile },
    }));
  }, [allColumns]);

  const table = useTable<typeof dataTableFeatures, ClassRosterEntry>({
    features: dataTableFeatures,
    data: filteredEntries,
    columns: tanstackColumns,
    state: {
      pagination: { pageIndex, pageSize },
      columnVisibility: {},
    },
    onPaginationChange: (updater) => {
      setPageIndex((prev) =>
        typeof updater === "function"
          ? updater({ pageIndex: prev, pageSize }).pageIndex
          : updater.pageIndex,
      );
    },
  });

  const handleRowClick = useCallback(
    (entry: ClassRosterEntry) => {
      onRowClick?.(entry);
    },
    [onRowClick],
  );

  if (loading) {
    return (
      <div className={clsx(styles.loading, className)}>
        <Spinner size="md" label="Loading roster" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        variant="error"
        title="Unable to load roster"
        description={error}
        className={className}
      />
    );
  }

  if (empty || filteredEntries.length === 0) {
    return (
      <div className={clsx(styles.tableWrapper, className)}>
        {searchable && !empty && (
          <div className={styles.toolbar}>
            <SearchInput
              value={query}
              onValueChange={setQuery}
              placeholder={searchPlaceholder}
              ariaLabel={ariaLabel}
            />
          </div>
        )}
        {filteredEntries.length === 0 && !empty ? (
          <EmptyState
            title="No learners found"
            description={query ? "Try a different search term." : undefined}
          />
        ) : (
          <EmptyState
            title="No learners enrolled"
            description="This class has no learners in its roster."
          />
        )}
      </div>
    );
  }

  const rows = table.getRowModel().rows;
  const headerGroups = table.getHeaderGroups();
  const leafHeaders =
    headerGroups.length > 0
      ? headerGroups[headerGroups.length - 1].headers
      : [];

  return (
    <div className={clsx(styles.tableWrapper, className)}>
      {searchable && (
        <div className={styles.toolbar}>
          <SearchInput
            value={query}
            onValueChange={setQuery}
            placeholder={searchPlaceholder}
            ariaLabel={ariaLabel}
          />
          <span className={styles.count}>
            {filteredEntries.length} learner{filteredEntries.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      <Table stickyHeader aria-label={ariaLabel}>
        <Table.Header>
          <Table.Row>
            {leafHeaders.map((header) => {
              const col = header.column;
              const meta = (col.columnDef as { meta?: { width?: string; hideOnMobile?: boolean } }).meta;
              return (
                <Table.Head
                  key={col.id}
                  className={clsx(meta?.hideOnMobile && styles.hideOnMobile)}
                >
                  {flexRender(col.columnDef.header, header.getContext())}
                </Table.Head>
              );
            })}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((row) => (
            <Table.Row
              key={row.id}
              onClick={onRowClick ? () => handleRowClick(row.original) : undefined}
              className={clsx(onRowClick && styles.clickableRow)}
            >
              {row.getVisibleCells().map((cell) => {
                const meta = (cell.column.columnDef as { meta?: { width?: string; hideOnMobile?: boolean } }).meta;
                return (
                  <Table.Cell
                    key={cell.column.id}
                    className={clsx(meta?.hideOnMobile && styles.hideOnMobile)}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Cell>
                );
              })}
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      {rows.length > pageSize && (
        <DataTablePagination
          pageIndex={pageIndex}
          pageSize={pageSize}
          pageCount={Math.ceil(filteredEntries.length / pageSize)}
          rowCount={filteredEntries.length}
          onPageChange={setPageIndex}
        />
      )}
    </div>
  );
}
