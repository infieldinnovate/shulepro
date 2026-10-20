import type { ReactNode } from "react";
import { CompetencyMatrix as SharedCompetencyMatrix } from "../../../shared/CompetencyMatrix";
import type {
  CompetencyLearner,
  CompetencyColumn,
  CellColorScale,
  CompetencyMatrixDrillDown,
  PerformanceScaleLevel,
  PerformanceScaleMap,
} from "../../../shared/CompetencyMatrix";
import type { AttainmentLevel } from "../types";

export interface AssessmentCompetencyMatrixProps {
  title: string;
  /** Configurable attainment levels — mapped to the shared PerformanceScaleLevel. */
  attainmentLevels: AttainmentLevel[];
  learners: CompetencyLearner[];
  competencies: CompetencyColumn[];
  onCellDrillDown?: (info: CompetencyMatrixDrillDown) => void;
  cellColorScale?: CellColorScale;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  summary?: string;
  className?: string;
  children?: ReactNode;
}

function mapAttainmentToScale(
  levels: AttainmentLevel[],
): PerformanceScaleLevel[] {
  return [...levels]
    .sort((a, b) => a.order - b.order)
    .map((level) => ({
      key: level.key,
      label: level.label,
      shortLabel: level.shortLabel,
      description: level.description,
    }));
}

function buildScaleMap(levels: AttainmentLevel[]): PerformanceScaleMap {
  const sorted = [...levels].sort((a, b) => a.order - b.order);
  const map = new Map<number, string>();
  sorted.forEach((level, index) => {
    map.set(index + 1, level.key);
  });
  return map as PerformanceScaleMap;
}

export function CompetencyMatrix({
  title,
  attainmentLevels,
  learners,
  competencies,
  onCellDrillDown,
  cellColorScale,
  loading = false,
  error,
  empty = false,
  summary,
  className,
  children,
}: AssessmentCompetencyMatrixProps) {
  const scale = mapAttainmentToScale(attainmentLevels);
  const scaleMap = buildScaleMap(attainmentLevels);

  return (
    <SharedCompetencyMatrix
      title={title}
      scale={scale}
      scaleMap={scaleMap}
      competencies={competencies}
      learners={learners}
      onCellDrillDown={onCellDrillDown}
      cellColorScale={cellColorScale}
      loading={loading}
      error={error}
      empty={empty}
      summary={summary}
      className={className}
    >
      {children}
    </SharedCompetencyMatrix>
  );
}
