"use client";

import type { ReactNode } from "react";
import { School as SchoolIcon } from "lucide-react";
import { Combobox } from "@/components/ui/Combobox";
import type { SchoolOption } from "@/components/layout/headerTypes";
import styles from "./SchoolSwitcher.module.scss";

export interface SchoolSwitcherProps {
  schools: SchoolOption[];
  currentSchoolId?: string;
  onSwitch?: (schoolId: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  /** Hide the leading school icon. */
  hideIcon?: boolean;
  className?: string;
}

export function SchoolSwitcher({
  schools,
  currentSchoolId,
  onSwitch,
  placeholder = "Select school",
  ariaLabel = "Switch school",
  hideIcon = false,
  className,
}: SchoolSwitcherProps) {
  const options = schools.map((school) => ({
    value: school.id,
    label: school.code ? `${school.name} \u00b7 ${school.code}` : school.name,
  }));

  return (
    <div className={styles.container}>
      {!hideIcon && (
        <span className={styles.icon} aria-hidden="true">
          <SchoolIcon />
        </span>
      )}
      <Combobox
        options={options}
        value={currentSchoolId}
        onValueChange={(value) => onSwitch?.(value)}
        placeholder={placeholder}
        searchPlaceholder="Search schools\u2026"
        emptyText="No schools found"
        clearable={false}
        aria-label={ariaLabel}
        className={className}
      />
    </div>
  );
}

export type { SchoolOption } from "@/components/layout/headerTypes";

export type SchoolSwitcherComponentProps = SchoolSwitcherProps & {
  children?: ReactNode;
};
