import type { ReactNode, CSSProperties } from "react";
import { Info } from "lucide-react";
import clsx from "clsx";
import { Spinner } from "../../ui/Spinner";
import { EmptyState } from "../../ui/EmptyState";
import { Alert } from "../../ui/Alert";
import { classifyDataPoint, type DataPresence } from "@/lib/analytics";
import styles from "./CompetencyMatrix.module.scss";

export interface PerformanceScaleLevel {
  key: string;
  label: string;
  shortLabel?: string;
  description?: string;
}

export type PerformanceScaleMap = ReadonlyMap<number, string>;

export type CellColorScale = (
  levelKey: string | null,
  presence: DataPresence,
) => { background?: string; color?: string } | null;

export interface CompetencyCellValue {
  value: number | null | undefined;
  levelKey?: string;
  displayLabel?: string;
}

export interface CompetencyLearner {
  key: string;
  name: string;
  identifier?: string;
  values: Record<string, CompetencyCellValue>;
}

export interface CompetencyColumn {
  key: string;
  label: string;
  shortLabel?: string;
  description?: string;
}

export interface CompetencyMatrixDrillDown {
  learnerKey: string;
  competencyKey: string;
  value: number | null | undefined;
  levelKey: string | null;
}

export interface CompetencyMatrixProps {
  title: string;
  scale: PerformanceScaleLevel[];
  scaleMap: PerformanceScaleMap;
  competencies: CompetencyColumn[];
  learners: CompetencyLearner[];
  cellColorScale?: CellColorScale;
  onCellDrillDown?: (info: CompetencyMatrixDrillDown) => void;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  summary?: string;
  className?: string;
  children?: ReactNode;
}

function resolveLevelKey(
  cell: CompetencyCellValue,
  scaleMap: PerformanceScaleMap,
): string | null {
  if (cell.levelKey) return cell.levelKey;
  if (cell.value == null) return null;
  return scaleMap.get(cell.value) ?? null;
}

function levelLabel(
  levelKey: string | null,
  scale: PerformanceScaleLevel[],
): string | null {
  if (!levelKey) return null;
  const lvl = scale.find((s) => s.key === levelKey);
  return lvl ? lvl.shortLabel ?? lvl.label : null;
}

export function CompetencyMatrix({
  title,
  scale,
  scaleMap,
  competencies,
  learners,
  cellColorScale,
  onCellDrillDown,
  loading = false,
  error,
  empty = false,
  summary,
  className,
  children,
}: CompetencyMatrixProps) {
  const body = (() => {
    if (loading) {
      return (
        <div className={styles.loadingBody}>
          <Spinner size="md" label={`Loading ${title}`} />
        </div>
      );
    }
    if (error) {
      return <Alert variant="error" title="Data unavailable" description={error} />;
    }
    if (empty || learners.length === 0 || competencies.length === 0) {
      return (
        <EmptyState
          icon={<Info aria-hidden="true" />}
          title="No competency data"
          description={`There is no competency data available for ${title.toLowerCase()} yet.`}
        />
      );
    }

    return (
      <div
        className={styles.scroll}
        role="region"
        aria-label={title}
        tabIndex={0}
      >
        <table className={styles.table}>
          <caption className={styles.caption}>
            {summary ??
              `${title}: ${learners.length} learner(s) across ${competencies.length} competenc(ies).`}
          </caption>
          <thead>
            <tr>
              <th scope="col" className={styles.learnerCol}>
                Learner
              </th>
              {competencies.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className={styles.competencyCol}
                  title={c.description}
                  aria-label={c.label}
                >
                  <span className={styles.compLabel} aria-hidden="true">
                    {c.shortLabel ?? c.label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {learners.map((learner) => (
              <tr key={learner.key} className={styles.row}>
                <th scope="row" className={styles.learnerCol}>
                  <span className={styles.learnerName}>{learner.name}</span>
                  {learner.identifier && (
                    <span className={styles.learnerId}>{learner.identifier}</span>
                  )}
                </th>
                {competencies.map((comp) => {
                  const cell = learner.values[comp.key];
                  const hasCell = cell != null;
                  const presence: DataPresence = hasCell
                    ? classifyDataPoint(cell.value)
                    : "missing";
                  const levelKey = hasCell ? resolveLevelKey(cell, scaleMap) : null;
                  const label = hasCell
                    ? cell.displayLabel ?? levelLabel(levelKey, scale) ?? "—"
                    : "Not assessed";
                  const colorStyle = cellColorScale
                    ? cellColorScale(levelKey, presence)
                    : null;
                  const interactive =
                    Boolean(onCellDrillDown) && presence !== "missing";
                  const cellStyle: CSSProperties = {};
                  if (colorStyle?.background)
                    cellStyle.backgroundColor = colorStyle.background;
                  if (colorStyle?.color) cellStyle.color = colorStyle.color;

                  return (
                    <td
                      key={comp.key}
                      className={clsx(
                        styles.cell,
                        presence === "missing" && styles.cellMissing,
                        presence === "zero" && styles.cellZero,
                        interactive && styles.cellInteractive,
                      )}
                      style={cellStyle}
                      title={
                        presence === "missing"
                          ? `${learner.name} — ${comp.label}: not assessed`
                          : `${learner.name} — ${comp.label}: ${label}`
                      }
                    >
                      {interactive ? (
                        <button
                          type="button"
                          className={styles.cellBtn}
                          aria-label={`${learner.name}, ${comp.label}: ${label}`}
                          onClick={() =>
                            onCellDrillDown!({
                              learnerKey: learner.key,
                              competencyKey: comp.key,
                              value: cell.value,
                              levelKey,
                            })
                          }
                        >
                          <span className={styles.cellText}>{label}</span>
                        </button>
                      ) : (
                        <span
                          className={styles.cellText}
                          aria-label={
                            presence === "missing"
                              ? `${learner.name}, ${comp.label}: not assessed`
                              : `${learner.name}, ${comp.label}: ${label}`
                          }
                        >
                          {presence === "missing" ? (
                            <span className={styles.notAssessed}>—</span>
                          ) : (
                            label
                          )}
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
    );
  })();

  return (
    <section className={clsx(styles.section, className)} aria-label={title}>
      <h4 className={styles.srOnly}>{title}</h4>
      {body}
      {children}
      {scale.length > 0 && !loading && !error && !empty && (
        <div className={styles.legend} aria-hidden="true">
          <span className={styles.legendTitle}>Scale:</span>
          <ul className={styles.legendList}>
            {scale.map((lvl) => {
              const colorStyle = cellColorScale
                ? cellColorScale(lvl.key, "present")
                : null;
              return (
                <li key={lvl.key} className={styles.legendItem}>
                  <span
                    className={styles.legendSwatch}
                    style={{
                      backgroundColor:
                        colorStyle?.background ?? "var(--color-surface-muted)",
                      color: colorStyle?.color ?? "var(--color-fg)",
                    }}
                  >
                    {lvl.shortLabel ?? lvl.label}
                  </span>
                  <span className={styles.legendLabel}>{lvl.label}</span>
                </li>
              );
            })}
            <li className={styles.legendItem}>
              <span
                className={clsx(
                  styles.legendSwatch,
                  styles.legendSwatchMissing,
                )}
              >
                —
              </span>
              <span className={styles.legendLabel}>Not assessed</span>
            </li>
          </ul>
        </div>
      )}
    </section>
  );
}
