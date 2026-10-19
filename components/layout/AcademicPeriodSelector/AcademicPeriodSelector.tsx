"use client";

import type { ReactNode } from "react";
import { CalendarRange } from "lucide-react";
import { Select } from "../../ui/Select";
import clsx from "clsx";
import type { AcademicPeriodOption } from "../headerTypes";
import styles from "./AcademicPeriodSelector.module.scss";
 
export interface AcademicPeriodSelectorProps {
  yearOptions: AcademicPeriodOption[];
  termOptions: AcademicPeriodOption[];
  assessmentPeriodOptions?: AcademicPeriodOption[];
  yearValue?: string;
  termValue?: string;
  assessmentPeriodValue?: string;
  onYearChange?: (value: string) => void;
  onTermChange?: (value: string) => void;
  onAssessmentPeriodChange?: (value: string) => void;
  yearPlaceholder?: string;
  termPlaceholder?: string;
  assessmentPeriodPlaceholder?: string;
  /** Hide the assessment period selector when not relevant. */
  showAssessmentPeriod?: boolean;
  ariaLabel?: string;
  className?: string;
}

export function AcademicPeriodSelector({
  yearOptions,
  termOptions,
  assessmentPeriodOptions = [],
  yearValue,
  termValue,
  assessmentPeriodValue,
  onYearChange,
  onTermChange,
  onAssessmentPeriodChange,
  yearPlaceholder = "Year",
  termPlaceholder = "Term",
  assessmentPeriodPlaceholder = "Assessment",
  showAssessmentPeriod = false,
  ariaLabel = "Academic period",
  className,
}: AcademicPeriodSelectorProps) {
  return (
    <div
      className={clsx(styles.container, className)}
      role="group"
      aria-label={ariaLabel}
    >
      <span className={styles.icon} aria-hidden="true">
        <CalendarRange />
      </span>
      <div className={styles.selects}>
        <Select
          selectSize="sm"
          options={yearOptions}
          value={yearValue}
          placeholder={yearPlaceholder}
          aria-label="Academic year"
          onChange={(e) => onYearChange?.(e.target.value)}
          className={styles.select}
        />
        <Select
          selectSize="sm"
          options={termOptions}
          value={termValue}
          placeholder={termPlaceholder}
          aria-label="Term"
          onChange={(e) => onTermChange?.(e.target.value)}
          className={styles.select}
        />
        {showAssessmentPeriod && (
          <Select
            selectSize="sm"
            options={assessmentPeriodOptions}
            value={assessmentPeriodValue}
            placeholder={assessmentPeriodPlaceholder}
            aria-label="Assessment period"
            onChange={(e) => onAssessmentPeriodChange?.(e.target.value)}
            className={styles.select}
          />
        )}
      </div>
    </div>
  );
}

export type { AcademicPeriodOption } from "../headerTypes";

export type AcademicPeriodSelectorComponentProps = AcademicPeriodSelectorProps & {
  children?: ReactNode;
};
