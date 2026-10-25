"use client";

import { useCallback } from "react";
import type { KeyboardEvent } from "react";
import { X } from "lucide-react";
import clsx from "clsx";
import { Button, IconButton } from "@/components/ui/Button";
import styles from "./FilterChips.module.scss";

export interface FilterChip {
  id: string;
  label: string;
  value?: string;
  onRemove: () => void;
}

export interface FilterChipsProps {
  chips: FilterChip[];
  onClearAll?: () => void;
  clearAllLabel?: string;
  ariaLabel?: string;
  className?: string;
}

export function FilterChips({
  chips,
  onClearAll,
  clearAllLabel = "Clear all",
  ariaLabel = "Active filters",
  className,
}: FilterChipsProps) {
  const handleRemoveKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, onRemove: () => void) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onRemove();
      }
    },
    [],
  );

  const hasChips = chips.length > 0;
  if (!hasChips && !onClearAll) return null;

  return (
    <div
      className={clsx(styles.group, className)}
      role="group"
      aria-label={ariaLabel}
    >
      {chips.map((chip) => (
        <span key={chip.id} className={styles.chip}>
          <span className={styles.chipLabel}>
            {chip.label}
            {chip.value && (
              <span className={styles.chipValue}>: {chip.value}</span>
            )}
          </span>
          <IconButton
            variant="ghost"
            size="sm"
            onClick={chip.onRemove}
            onKeyDown={(e) => handleRemoveKeyDown(e, chip.onRemove)}
            label={`Remove filter: ${chip.label}${
              chip.value ? ` ${chip.value}` : ""
            }`}
            className={styles.removeButton}
          >
            <X size={14} aria-hidden="true" />
          </IconButton>
        </span>
      ))}
      {onClearAll && hasChips && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className={styles.clearAllButton}
        >
          {clearAllLabel}
        </Button>
      )}
    </div>
  );
}
