import type { CSSProperties } from "react";
import { Grid3x3, Info } from "lucide-react";
import clsx from "clsx";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Alert } from "@/components/ui/Alert";
import { classifyDataPoint, type DataPresence } from "@/lib/analytics";
import type {
  CurriculumCoverageCell,
  CurriculumCoverageColumn,
  CurriculumCoverageRow,
  CurriculumCoverageState,
  CurriculumCoverageLegendEntry,
} from "@/components/features/curriculum/types";
import styles from "./CurriculumCoverageMatrix.module.scss";

export type CurriculumCoverageColorScale = (
  state: CurriculumCoverageState,
  presence: DataPresence,
) => { background?: string; color?: string } | null;

export interface CurriculumCoverageDrillDown {
  rowKey: string;
  columnKey: string;
  state: CurriculumCoverageState;
  value: number | null;
}

export interface CurriculumCoverageMatrixProps {
  rows: CurriculumCoverageRow[];
  columns: CurriculumCoverageColumn[];
  cells: CurriculumCoverageCell[];
  /** Custom color scale for cells. When omitted, default state-based colors are used. */
  cellColorScale?: CurriculumCoverageColorScale;
  onCellDrillDown?: (info: CurriculumCoverageDrillDown) => void;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  /** Optional summary text shown as a caption. */
  summary?: string;
  /** Accessible label for the matrix. */
  ariaLabel?: string;
  className?: string;
}

const DEFAULT_LEGEND: CurriculumCoverageLegendEntry[] = [
  { state: "planned", label: "Planned", description: "Scheduled but not yet taught" },
  { state: "taught", label: "Taught", description: "Content delivered" },
  { state: "assessed", label: "Assessed", description: "Assessment completed" },
  {
    state: "insufficient-evidence",
    label: "Insufficient evidence",
    description: "Not enough evidence to determine coverage",
  },
  { state: "not-started", label: "Not started", description: "No coverage activity yet" },
];

const DEFAULT_STATE_COLORS: Record<
  CurriculumCoverageState,
  { background: string; color: string }
> = {
  planned: { background: "var(--color-info-50)", color: "var(--color-info-700)" },
  taught: { background: "var(--color-primary-50)", color: "var(--color-primary-700)" },
  assessed: { background: "var(--color-success-50)", color: "var(--color-success-700)" },
  "insufficient-evidence": {
    background: "var(--color-warning-50)",
    color: "var(--color-warning-700)",
  },
  "not-started": { background: "var(--color-surface-muted)", color: "var(--color-fg-muted)" },
};

const STATE_LABELS: Record<CurriculumCoverageState, string> = {
  planned: "Planned",
  taught: "Taught",
  assessed: "Assessed",
  "insufficient-evidence": "Insufficient evidence",
  "not-started": "Not started",
};

function resolveCellLabel(
  cell: CurriculumCoverageCell,
  presence: DataPresence,
): string {
  if (cell.displayLabel) return cell.displayLabel;
  if (presence === "missing") return "—";
  if (cell.value != null) return String(cell.value);
  return STATE_LABELS[cell.state];
}

export function CurriculumCoverageMatrix({
  rows,
  columns,
  cells,
  cellColorScale,
  onCellDrillDown,
  loading = false,
  error,
  empty = false,
  summary,
  ariaLabel = "Curriculum coverage matrix",
  className,
}: CurriculumCoverageMatrixProps) {
  const cellMap = new Map<string, CurriculumCoverageCell>();
  for (const cell of cells) {
    cellMap.set(`${cell.rowKey}::${cell.columnKey}`, cell);
  }

  if (loading) {
    return (
      <section className={clsx(styles.section, className)} aria-label={ariaLabel}>
        <div className={styles.loading}>
          <Spinner size="md" label="Loading coverage matrix" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={clsx(styles.section, className)} aria-label={ariaLabel}>
        <Alert
          variant="error"
          title="Unable to load coverage data"
          description={error}
        />
      </section>
    );
  }

  if (empty || rows.length === 0 || columns.length === 0) {
    return (
      <section className={clsx(styles.section, className)} aria-label={ariaLabel}>
        <EmptyState
          icon={<Grid3x3 aria-hidden="true" />}
          title="No coverage data"
          description="There is no curriculum coverage data to display."
        />
      </section>
    );
  }

  return (
    <section className={clsx(styles.section, className)} aria-label={ariaLabel}>
      <div
        className={styles.scroll}
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
      >
        <table className={styles.table}>
          <caption className={styles.caption}>
            {summary ??
              `${rows.length} outcome(s) across ${columns.length} column(s).`}
          </caption>
          <thead>
            <tr>
              <th scope="col" className={styles.rowCol}>
                <span className={styles.rowColLabel}>Outcome</span>
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={styles.colHeader}
                  title={col.description ?? col.label}
                  aria-label={col.label}
                >
                  <span className={styles.colLabel} aria-hidden="true">
                    {col.shortLabel ?? col.label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className={styles.row}>
                <th scope="row" className={styles.rowCol}>
                  <span className={styles.rowLabel}>{row.label}</span>
                  {row.code && (
                    <span className={styles.rowCode}>{row.code}</span>
                  )}
                </th>
                {columns.map((col) => {
                  const cell = cellMap.get(`${row.key}::${col.key}`);
                  const hasCell = cell != null;
                  const state: CurriculumCoverageState = cell?.state ?? "not-started";
                  const presence: DataPresence = hasCell
                    ? classifyDataPoint(cell!.value ?? null)
                    : "missing";
                  const label = hasCell
                    ? resolveCellLabel(cell!, presence)
                    : "—";
                  const colorStyle = cellColorScale
                    ? cellColorScale(state, presence)
                    : DEFAULT_STATE_COLORS[state];
                  const interactive =
                    Boolean(onCellDrillDown) &&
                    hasCell &&
                    state !== "not-started";
                  const cellStyle: CSSProperties = {};
                  if (colorStyle?.background)
                    cellStyle.backgroundColor = colorStyle.background;
                  if (colorStyle?.color) cellStyle.color = colorStyle.color;

                  return (
                    <td
                      key={col.key}
                      className={clsx(
                        styles.cell,
                        state === "not-started" && styles.cellNotStarted,
                        state === "insufficient-evidence" &&
                          styles.cellInsufficient,
                        interactive && styles.cellInteractive,
                      )}
                      style={cellStyle}
                      title={`${row.label} — ${col.label}: ${STATE_LABELS[state]}`}
                    >
                      {interactive ? (
                        <button
                          type="button"
                          className={styles.cellBtn}
                          aria-label={`${row.label}, ${col.label}: ${STATE_LABELS[state]}`}
                          onClick={() =>
                            onCellDrillDown!({
                              rowKey: row.key,
                              columnKey: col.key,
                              state,
                              value: cell!.value ?? null,
                            })
                          }
                        >
                          <span className={styles.cellText}>{label}</span>
                        </button>
                      ) : (
                        <span
                          className={styles.cellText}
                          aria-label={`${row.label}, ${col.label}: ${STATE_LABELS[state]}`}
                        >
                          {label}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className={styles.legend} aria-hidden="true">
        <span className={styles.legendTitle}>Coverage:</span>
        <ul className={styles.legendList}>
          {DEFAULT_LEGEND.map((entry) => {
            const colors = cellColorScale
              ? cellColorScale(entry.state, "present")
              : DEFAULT_STATE_COLORS[entry.state];
            return (
              <li key={entry.state} className={styles.legendItem}>
                <span
                  className={styles.legendSwatch}
                  style={{
                    backgroundColor: colors?.background ?? "var(--color-surface-muted)",
                    color: colors?.color ?? "var(--color-fg)",
                  }}
                >
                  {entry.label.charAt(0)}
                </span>
                <span className={styles.legendLabel}>{entry.label}</span>
                {entry.description && (
                  <span className={styles.legendDesc}>
                    <Info aria-hidden="true" className={styles.legendInfoIcon} />
                    <span className={styles.legendTooltip}>{entry.description}</span>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
