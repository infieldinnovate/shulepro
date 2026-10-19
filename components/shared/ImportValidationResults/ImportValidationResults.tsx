import { CircleCheck as CheckCircle2, Circle as XCircle, Wrench } from "lucide-react";
import clsx from "clsx";
import { Table } from "../../ui/Table";
import { Badge } from "../../ui/Badge";
import { Button } from "../../ui/Button";
import styles from "./ImportValidationResults.module.scss";

export type ImportValidationRowStatus = "valid" | "invalid";

export interface ImportValidationResultEntry {
  /** 1-based row number from the source file. */
  row: number;
  /** Target field the issue relates to, when known. */
  field?: string;
  /** Human-readable reason (required for invalid rows). */
  reason?: string;
  status: ImportValidationRowStatus;
}

export interface ImportValidationSummary {
  valid: number;
  invalid: number;
  total: number;
}

export interface ImportValidationResultsProps {
  results: ImportValidationResultEntry[];
  summary: ImportValidationSummary;
  /** When provided, invalid rows show a "Fix" action. */
  onFixRow?: (entry: ImportValidationResultEntry) => void;
  /** Accessible label for the results region. */
  ariaLabel?: string;
  className?: string;
}

export function ImportValidationResults({
  results,
  summary,
  onFixRow,
  ariaLabel = "Import validation results",
  className,
}: ImportValidationResultsProps) {
  const hasResults = results.length > 0;
  const allValid = summary.invalid === 0 && summary.valid > 0;
  const hasInvalid = summary.invalid > 0;

  return (
    <div className={clsx(styles.wrapper, className)}>
      <div className={styles.summaryBar} role="status" aria-live="polite">
        <span className={styles.summaryItem}>
          <span className={styles.summaryValue}>{summary.total}</span>
          <span className={styles.summaryLabel}>Total</span>
        </span>
        <span className={clsx(styles.summaryItem, styles.validItem)}>
          <CheckCircle2 className={styles.summaryIcon} aria-hidden="true" />
          <span className={styles.summaryValue}>{summary.valid}</span>
          <span className={styles.summaryLabel}>Valid</span>
        </span>
        <span className={clsx(styles.summaryItem, hasInvalid && styles.invalidItem)}>
          <XCircle className={styles.summaryIcon} aria-hidden="true" />
          <span className={styles.summaryValue}>{summary.invalid}</span>
          <span className={styles.summaryLabel}>Invalid</span>
        </span>
      </div>

      {!hasResults ? (
        <p className={styles.empty}>No validation results yet.</p>
      ) : (
        <div className={styles.scrollRegion} aria-label={ariaLabel} role="group">
          <Table
            zebra
            density="dense"
            stickyHeader
            disableHover
            caption={`${summary.valid} valid, ${summary.invalid} invalid of ${summary.total} rows`}
            className={styles.table}
          >
            <Table.Header>
              <Table.Row>
                <Table.Head align="end" numeric>
                  Row
                </Table.Head>
                <Table.Head>Field</Table.Head>
                <Table.Head>Status</Table.Head>
                <Table.Head>Reason</Table.Head>
                {onFixRow && (
                  <Table.Head align="end">
                    <span className={styles.actionHeader}>Action</span>
                  </Table.Head>
                )}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {results.map((entry) => {
                const isInvalid = entry.status === "invalid";
                return (
                  <Table.Row
                    key={`${entry.row}-${entry.field ?? "row"}`}
                    className={clsx(isInvalid ? styles.invalidRow : styles.validRow)}
                  >
                    <Table.Cell align="end" numeric>
                      {entry.row}
                    </Table.Cell>
                    <Table.Cell className={styles.fieldCell}>
                      {entry.field ?? <span className={styles.muted}>—</span>}
                    </Table.Cell>
                    <Table.Cell>
                      {isInvalid ? (
                        <Badge variant="error" size="sm" dot>
                          Invalid
                        </Badge>
                      ) : (
                        <Badge variant="success" size="sm" dot>
                          Valid
                        </Badge>
                      )}
                    </Table.Cell>
                    <Table.Cell className={styles.reasonCell}>
                      {entry.reason ?? (
                        <span className={styles.muted}>No issues</span>
                      )}
                    </Table.Cell>
                    {onFixRow && (
                      <Table.Cell align="end" className={styles.actionCell}>
                        {isInvalid ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            leftIcon={<Wrench aria-hidden="true" />}
                            onClick={() => onFixRow(entry)}
                            className={styles.fixButton}
                          >
                            Fix
                          </Button>
                        ) : (
                          <span className={styles.muted} aria-hidden="true">
                            —
                          </span>
                        )}
                      </Table.Cell>
                    )}
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        </div>
      )}

      {hasResults && (
        <p className={styles.hint}>
          {allValid
            ? "All rows passed validation."
            : hasInvalid
              ? `${summary.invalid} row${summary.invalid === 1 ? "" : "s"} need attention before importing.`
              : undefined}
        </p>
      )}
    </div>
  );
}
