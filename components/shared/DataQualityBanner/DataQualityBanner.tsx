import type { ReactNode } from "react";
import { Alert } from "../../ui/Alert";
import { Badge } from "../../ui/Badge";
import styles from "./DataQualityBanner.module.scss";

export type DataQualitySeverity = "error" | "warning" | "info";

export interface DataQualityIssue {
  id: string;
  field: string;
  description: string;
  severity: DataQualitySeverity;
}

export interface DataQualityBannerProps {
  issues: DataQualityIssue[];
  title?: string;
  /** Controlled dismissal callback. */
  onDismiss?: () => void;
  /** Hide the banner entirely when there are no issues. Default true. */
  hideWhenClean?: boolean;
  className?: string;
  children?: ReactNode;
}

const SEVERITY_LABEL: Record<DataQualitySeverity, string> = {
  error: "Missing",
  warning: "Incomplete",
  info: "Note",
};

const VARIANT_MAP: Record<DataQualitySeverity, "error" | "warning" | "info"> = {
  error: "error",
  warning: "warning",
  info: "info",
};

export function DataQualityBanner({
  issues,
  title = "Data quality issues detected",
  onDismiss,
  hideWhenClean = true,
  className,
  children,
}: DataQualityBannerProps) {
  if (issues.length === 0 && hideWhenClean) return null;

  const hasError = issues.some((i) => i.severity === "error");
  const hasWarning = issues.some((i) => i.severity === "warning");
  const dominantVariant: "error" | "warning" | "info" = hasError
    ? "error"
    : hasWarning
      ? "warning"
      : "info";

  const description = (
    <span className={styles.description}>
      {issues.length} {issues.length === 1 ? "issue" : "issues"} found affecting data completeness.
    </span>
  );

  return (
    <Alert
      variant={dominantVariant}
      title={title}
      description={description}
      dismissible
      onDismiss={onDismiss}
      className={className}
    >
      <ul className={styles.issueList}>
        {issues.map((issue) => (
          <li key={issue.id} className={styles.issueItem}>
            <Badge variant={VARIANT_MAP[issue.severity]} size="sm">
              {SEVERITY_LABEL[issue.severity]}
            </Badge>
            <span className={styles.issueField}>{issue.field}</span>
            <span className={styles.issueDescription}>{issue.description}</span>
          </li>
        ))}
      </ul>
      {children}
    </Alert>
  );
}
