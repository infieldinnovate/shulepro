import clsx from "clsx";
import { Card } from "../../ui/Card";
import { Skeleton } from "../../ui/Skeleton";
import styles from "./DashboardSkeleton.module.scss";

export interface DashboardSkeletonProps {
  kpiCount?: number;
  showChart?: boolean;
  showTable?: boolean;
  className?: string;
}

export function DashboardSkeleton({
  kpiCount = 4,
  showChart = true,
  showTable = true,
  className,
}: DashboardSkeletonProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={clsx(styles.dashboard, className)}
    >
      <span className={styles.srOnly}>Loading dashboard</span>

      {/* KPI row */}
      <div className={styles.kpiRow}>
        {Array.from({ length: kpiCount }, (_, i) => (
          <Card key={i} className={styles.kpiCard}>
            <Skeleton variant="text" width="60%" height="0.875rem" />
            <Skeleton variant="text" width="40%" height="1.75rem" />
            <Skeleton variant="text" width="50%" height="0.875rem" />
          </Card>
        ))}
      </div>

      {/* Chart panel */}
      {showChart && (
        <Card className={styles.chartCard}>
          <Skeleton variant="text" width="30%" height="1.25rem" />
          <div className={styles.chartPlaceholder}>
            <Skeleton variant="rounded" width="100%" height="16rem" />
          </div>
        </Card>
      )}

      {/* Table / list */}
      {showTable && (
        <Card className={styles.tableCard}>
          <Skeleton variant="text" width="25%" height="1.25rem" />
          <div className={styles.tableRows}>
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className={styles.tableRow}>
                <Skeleton variant="text" width="30%" height="1rem" />
                <Skeleton variant="text" width="20%" height="1rem" />
                <Skeleton variant="text" width="25%" height="1rem" />
                <Skeleton variant="text" width="15%" height="1rem" />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
