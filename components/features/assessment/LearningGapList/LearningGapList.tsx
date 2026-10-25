import type { ReactNode } from "react";
import { LearningGapList as SharedLearningGapList } from "@/components/shared/LearningGapList";
import type {
  LearningGap,
  LearningGapSeverity,
  LearningGapScope,
  LearningGapListProps,
} from "@/components/shared/LearningGapList";

export type {
  LearningGap,
  LearningGapSeverity,
  LearningGapScope,
};

export interface AssessmentLearningGapListProps {
  title: string;
  gaps: LearningGap[];
  loading?: boolean;
  error?: string;
  empty?: boolean;
  summary?: string;
  className?: string;
  children?: ReactNode;
}

export function LearningGapList({
  title,
  gaps,
  loading,
  error,
  empty,
  summary,
  className,
  children,
}: AssessmentLearningGapListProps) {
  const sharedProps: LearningGapListProps = {
    title,
    gaps,
    loading,
    error,
    empty,
    summary,
    className,
    children,
  };

  return <SharedLearningGapList {...sharedProps} />;
}
