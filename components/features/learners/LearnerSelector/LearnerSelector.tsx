"use client";

import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Search, X } from "lucide-react";
import clsx from "clsx";
import { Combobox } from "@/components/ui/Combobox";
import { Checkbox } from "@/components/ui/Checkbox";
import { Avatar, AvatarGroup } from "@/components/ui/Avatar";
import { IconButton } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import type { Learner } from "@/components/features/learners/types";
import styles from "./LearnerSelector.module.scss";

export interface LearnerSelectorProps {
  learners: Learner[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  multiple?: boolean;
  searchable?: boolean;
  disabled?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  label?: ReactNode;
  helperText?: ReactNode;
  ariaLabel?: string;
  loading?: boolean;
  /** Max avatars shown in the selected AvatarGroup before an overflow count. */
  maxVisibleAvatars?: number;
  className?: string;
}

function learnerDisplayName(learner: Learner): string {
  const ident = learner.identifiers?.displayLabel;
  return ident ? `${learner.name} · ${ident}` : learner.name;
}

function learnerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function LearnerSelector({
  learners,
  selectedIds,
  onSelectionChange,
  multiple = false,
  searchable = true,
  disabled = false,
  placeholder = "Select learner",
  searchPlaceholder = "Search learners\u2026",
  emptyText = "No learners found",
  label,
  helperText,
  ariaLabel = "Learners",
  loading = false,
  maxVisibleAvatars = 5,
  className,
}: LearnerSelectorProps) {
  const [query, setQuery] = useState("");

  const selectedLearners = useMemo(
    () =>
      selectedIds
        .map((id) => learners.find((l) => l.id === id))
        .filter((l): l is Learner => l != null),
    [learners, selectedIds],
  );

  const filteredLearners = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return learners;
    return learners.filter((l) => {
      const name = l.name.toLowerCase();
      const ident = l.identifiers?.displayLabel?.toLowerCase();
      const altIds = l.identifiers?.alternateIds?.map((a) => a.value.toLowerCase());
      return (
        name.includes(normalized) ||
        (ident != null && ident.includes(normalized)) ||
        (altIds != null && altIds.some((v) => v.includes(normalized)))
      );
    });
  }, [learners, query]);

  const toggle = useCallback(
    (id: string) => {
      if (disabled) return;
      const next = selectedIds.includes(id)
        ? selectedIds.filter((s) => s !== id)
        : [...selectedIds, id];
      onSelectionChange(next);
    },
    [disabled, selectedIds, onSelectionChange],
  );

  const removeSelected = useCallback(
    (id: string) => {
      if (disabled) return;
      onSelectionChange(selectedIds.filter((s) => s !== id));
    },
    [disabled, selectedIds, onSelectionChange],
  );

  // ---- Loading state ----
  if (loading) {
    return (
      <div className={clsx(styles.loading, className)}>
        <Spinner size="md" label="Loading learners" />
      </div>
    );
  }

  // ---- Empty state (no learners at all) ----
  if (learners.length === 0) {
    return (
      <EmptyState
        title={emptyText}
        className={className}
      />
    );
  }

  // ---- Single-select: delegate to Combobox ----
  if (!multiple) {
    const options = learners.map((l) => ({
      value: l.id,
      label: learnerDisplayName(l),
      disabled: false,
    }));
    return (
      <div className={clsx(styles.container, className)}>
        {label && <span className={styles.label}>{label}</span>}
        <Combobox
          options={options}
          value={selectedIds[0] ?? ""}
          onValueChange={(value) => onSelectionChange(value ? [value] : [])}
          placeholder={placeholder}
          searchPlaceholder={searchPlaceholder}
          emptyText={emptyText}
          disabled={disabled}
          clearable
          aria-label={ariaLabel}
        />
        {selectedLearners.length > 0 && (
          <div className={styles.selectedRow}>
            <Avatar
              src={selectedLearners[0].avatarSrc}
              name={selectedLearners[0].initials ?? learnerInitials(selectedLearners[0].name)}
              alt={selectedLearners[0].name}
              size="sm"
            />
            <span className={styles.selectedName}>
              {selectedLearners[0].name}
              {selectedLearners[0].identifiers?.displayLabel && (
                <span className={styles.selectedIdent}>
                  {selectedLearners[0].identifiers.displayLabel}
                </span>
              )}
            </span>
          </div>
        )}
        {helperText && <p className={styles.helper}>{helperText}</p>}
      </div>
    );
  }

  // ---- Multi-select: searchable checkbox list ----
  return (
    <div className={clsx(styles.container, className)}>
      {label && <span className={styles.label}>{label}</span>}

      {selectedLearners.length > 0 && (
        <div className={styles.chips}>
          <AvatarGroup max={maxVisibleAvatars}>
            {selectedLearners.map((l) => (
              <Avatar
                key={l.id}
                src={l.avatarSrc}
                name={l.initials ?? learnerInitials(l.name)}
                alt={l.name}
                size="sm"
              />
            ))}
          </AvatarGroup>
          <ul className={styles.chipList} aria-label={`Selected ${ariaLabel}`}>
            {selectedLearners.map((l) => (
              <li key={l.id} className={styles.chip}>
                <Avatar
                  src={l.avatarSrc}
                  name={l.initials ?? learnerInitials(l.name)}
                  alt={l.name}
                  size="sm"
                />
                <Badge variant="neutral" size="sm" className={styles.chipName}>{l.name}</Badge>
                {!disabled && (
                  <IconButton
                    variant="ghost"
                    size="sm"
                    label={`Remove ${l.name}`}
                    onClick={() => removeSelected(l.id)}
                    className={styles.chipRemove}
                  >
                    <X aria-hidden="true" />
                  </IconButton>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {searchable && (
        <Input
          type="search"
          value={query}
          placeholder={searchPlaceholder}
          disabled={disabled}
          aria-label={ariaLabel}
          leadingIcon={<Search aria-hidden="true" />}
          className={styles.searchInput}
          onChange={(e) => setQuery(e.target.value)}
        />
      )}

      <ul className={styles.list} role="group" aria-label={ariaLabel}>
        {filteredLearners.length === 0 ? (
          <li className={styles.empty}>{emptyText}</li>
        ) : (
          filteredLearners.map((l) => {
            const isSelected = selectedIds.includes(l.id);
            const ident = l.identifiers?.displayLabel;
            return (
              <li key={l.id} className={styles.option}>
                <Checkbox
                  checked={isSelected}
                  disabled={disabled}
                  label={
                    <span className={styles.optionContent}>
                      <Avatar
                        src={l.avatarSrc}
                        name={l.initials ?? learnerInitials(l.name)}
                        alt={l.name}
                        size="sm"
                      />
                      <span className={styles.optionText}>
                        <span className={styles.optionName}>{l.name}</span>
                        {ident && (
                          <span className={styles.optionIdent}>{ident}</span>
                        )}
                      </span>
                    </span>
                  }
                  onChange={() => toggle(l.id)}
                  className={styles.optionCheckbox}
                />
              </li>
            );
          })
        )}
      </ul>

      {helperText && <p className={styles.helper}>{helperText}</p>}
    </div>
  );
}
