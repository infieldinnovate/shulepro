import clsx from "clsx";
import { Skeleton } from "../../ui/Skeleton";
import styles from "./TableSkeleton.module.scss";

export interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  showHeader = true,
  className,
}: TableSkeletonProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={clsx(styles.wrapper, className)}
    >
      <span className={styles.srOnly}>Loading table data</span>
      <div className={styles.scroll} aria-hidden="true">
        <table className={styles.table}>
          {showHeader && (
            <thead>
              <tr>
                {Array.from({ length: columns }, (_, i) => (
                  <th key={i} className={styles.headerCell}>
                    <Skeleton variant="text" width="80%" height="1rem" />
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {Array.from({ length: rows }, (_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }, (_, colIndex) => (
                  <td key={colIndex} className={styles.bodyCell}>
                    <Skeleton variant="text" width="90%" height="1rem" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
