import type {
  HTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
  ReactNode,
} from "react";
import clsx from "clsx";
import styles from "./Table.module.scss";

export type TableDensity = "default" | "dense";

export interface TableProps extends HTMLAttributes<HTMLDivElement> {
  /** Render the header row sticky inside the scroll container. */
  stickyHeader?: boolean;
  /** Alternate row background by row index. */
  zebra?: boolean;
  /** Disable the row hover highlight. */
  disableHover?: boolean;
  /** Compact row + cell padding and smaller text. */
  density?: TableDensity;
  /** Remove borders between rows and around the container. */
  borderless?: boolean;
  /** Accessible caption rendered via <caption>. */
  caption?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export function Table({
  stickyHeader = false,
  zebra = false,
  disableHover = false,
  density = "default",
  borderless = false,
  caption,
  className,
  children,
  ...props
}: TableProps) {
  return (
    <div
      className={clsx(
        styles.scroller,
        borderless && styles.borderless,
        className,
      )}
      {...props}
    >
      <table
        className={clsx(
          styles.table,
          stickyHeader && styles.sticky,
          zebra && styles.zebra,
          disableHover && styles.noHover,
          density === "dense" && styles.dense,
        )}
      >
        {caption && <caption className={styles.caption}>{caption}</caption>}
        {children}
      </table>
    </div>
  );
}

export type TableHeaderProps = HTMLAttributes<HTMLTableSectionElement>;

export function TableHeader({ className, children, ...props }: TableHeaderProps) {
  return (
    <thead className={clsx(styles.head, className)} {...props}>
      {children}
    </thead>
  );
}

export type TableBodyProps = HTMLAttributes<HTMLTableSectionElement>;

export function TableBody({ className, children, ...props }: TableBodyProps) {
  return (
    <tbody className={clsx(styles.body, className)} {...props}>
      {children}
    </tbody>
  );
}

export interface TableRowProps
  extends HTMLAttributes<HTMLTableRowElement> {
  /** Highlight the row as selected. */
  selected?: boolean;
}

export function TableRow({
  selected = false,
  className,
  children,
  ...props
}: TableRowProps) {
  return (
    <tr
      className={clsx(styles.row, selected && styles.rowSelected, className)}
      {...props}
    >
      {children}
    </tr>
  );
}

export interface TableHeadProps
  extends Omit<ThHTMLAttributes<HTMLTableCellElement>, "align"> {
  align?: "start" | "center" | "end";
  numeric?: boolean;
}

export function TableHead({
  align,
  numeric = false,
  className,
  children,
  ...props
}: TableHeadProps) {
  return (
    <th
      scope="col"
      className={clsx(
        styles.headCell,
        align === "center" && styles.center,
        (align === "end" || numeric) && styles.numeric,
        className,
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export interface TableCellProps
  extends Omit<TdHTMLAttributes<HTMLTableCellElement>, "align"> {
  align?: "start" | "center" | "end";
  numeric?: boolean;
  /** Truncate long content with an ellipsis (nowrap + max width). */
  truncate?: boolean;
}

export function TableCell({
  align,
  numeric = false,
  truncate = false,
  className,
  children,
  ...props
}: TableCellProps) {
  return (
    <td
      className={clsx(
        styles.cell,
        align === "center" && styles.center,
        (align === "end" || numeric) && styles.numeric,
        truncate && styles.truncate,
        className,
      )}
      {...props}
    >
      {children}
    </td>
  );
}

Table.Header = TableHeader;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Head = TableHead;
Table.Cell = TableCell;
