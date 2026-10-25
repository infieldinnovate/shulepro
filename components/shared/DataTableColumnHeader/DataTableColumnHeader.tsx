"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import clsx from "clsx";
import { Table } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import styles from "./DataTableColumnHeader.module.scss";

export interface DataTableColumnHeaderProps {
  sortable?: boolean;
  sortDir?: "asc" | "desc";
  onSort?: (e: unknown) => void;
  align?: "start" | "center" | "end";
  numeric?: boolean;
  className?: string;
  children?: ReactNode;
}

export function DataTableColumnHeader({
  sortable = false,
  sortDir,
  onSort,
  align,
  numeric,
  className,
  children,
}: DataTableColumnHeaderProps) {
  if (!sortable || !onSort) {
    return (
      <Table.Head align={align} numeric={numeric} className={className}>
        {children}
      </Table.Head>
    );
  }

  const sortLabel =
    sortDir === "asc"
      ? "sorted ascending"
      : sortDir === "desc"
        ? "sorted descending"
        : "not sorted";

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSort(e);
    }
  };

  const Icon = !sortDir
    ? ArrowUpDown
    : sortDir === "asc"
      ? ArrowUp
      : ArrowDown;

  return (
    <Table.Head
      align={align}
      numeric={numeric}
      aria-sort={
        sortDir === "asc"
          ? "ascending"
          : sortDir === "desc"
            ? "descending"
            : "none"
      }
      className={clsx(styles.sortable, className)}
    >
      <Button
        variant="ghost"
        size="sm"
        className={styles.sortButton}
        onClick={onSort as (e: unknown) => void}
        onKeyDown={handleKeyDown}
        aria-label={`${typeof children === "string" ? children : "column"}, ${sortLabel}`}
      >
        <span className={styles.sortLabel}>{children}</span>
        <Icon
          className={clsx(styles.sortIcon, sortDir && styles.active)}
          aria-hidden="true"
        />
      </Button>
    </Table.Head>
  );
}
