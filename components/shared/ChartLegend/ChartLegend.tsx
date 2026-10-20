"use client";

import clsx from "clsx";
import { resolveChartColor, type ChartColorToken } from "@/lib/chartColors";
import styles from "./ChartLegend.module.scss";

export interface ChartLegendItem {
  key: string;
  name: string;
  color: ChartColorToken | string;
  /** Optional numeric/ formatted value shown beside the label. */
  value?: string | number;
}

export interface ChartLegendProps {
  items: ChartLegendItem[];
  /** Layout direction. Defaults to row (wrapping). */
  direction?: "row" | "column";
  className?: string;
}

export function ChartLegend({
  items,
  direction = "row",
  className,
}: ChartLegendProps) {
  if (items.length === 0) return null;
  return (
    <ul
      className={clsx(styles.legend, direction === "column" && styles.column, className)}
      role="list"
    >
      {items.map((item) => (
        <li key={item.key} className={styles.item}>
          <span
            className={styles.swatch}
            style={{ backgroundColor: resolveChartColor(item.color) }}
            aria-hidden="true"
          />
          <span className={styles.label}>{item.name}</span>
          {item.value != null && item.value !== "" && (
            <span className={styles.value}>{item.value}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
