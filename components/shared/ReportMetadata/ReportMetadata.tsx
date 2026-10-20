import type { ReactNode } from "react";
import { Clock, Database, FileText, Layers } from "lucide-react";
import clsx from "clsx";
import styles from "./ReportMetadata.module.scss";

export interface ReportMetadataItem {
  /** Icon override for this field. */
  icon?: ReactNode;
  /** Visible label for the field. */
  label: ReactNode;
  /** Visible value for the field. */
  value: ReactNode;
}

export interface ReportMetadataProps {
  /** When the report was generated. */
  generatedOn?: ReactNode;
  /** The point-in-time the data reflects. */
  dataAsOf?: ReactNode;
  /** The data source(s) the report draws from. */
  source?: ReactNode;
  /** Coverage scope (e.g. "Grades 1–6, 2025"). */
  coverage?: ReactNode;
  /**
   * Additional or replacement metadata items. When provided alongside the
   * named fields, the named fields render first in their standard order,
   * followed by these extras.
   */
  items?: ReportMetadataItem[];
  /** Render as a compact inline list instead of a definition grid. */
  compact?: boolean;
  className?: string;
}

export function ReportMetadata({
  generatedOn,
  dataAsOf,
  source,
  coverage,
  items,
  compact = false,
  className,
}: ReportMetadataProps) {
  const standard: ReportMetadataItem[] = [];
  if (generatedOn) {
    standard.push({
      icon: <Clock aria-hidden="true" />,
      label: "Generated on",
      value: generatedOn,
    });
  }
  if (dataAsOf) {
    standard.push({
      icon: <FileText aria-hidden="true" />,
      label: "Data as of",
      value: dataAsOf,
    });
  }
  if (source) {
    standard.push({
      icon: <Database aria-hidden="true" />,
      label: "Source",
      value: source,
    });
  }
  if (coverage) {
    standard.push({
      icon: <Layers aria-hidden="true" />,
      label: "Coverage",
      value: coverage,
    });
  }

  const all = [...standard, ...(items ?? [])];

  if (all.length === 0) return null;

  return (
    <dl
      className={clsx(styles.metadata, compact && styles.compact, className)}
    >
      {all.map((item, idx) => (
        <div key={idx} className={styles.item}>
          <dt className={styles.label}>
            {item.icon && (
              <span className={styles.icon} aria-hidden="true">
                {item.icon}
              </span>
            )}
            {item.label}
          </dt>
          <dd className={styles.value}>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
