"use client";

import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Search, X } from "lucide-react";
import clsx from "clsx";
import { Combobox } from "@/components/ui/Combobox";
import { Checkbox } from "@/components/ui/Checkbox";
import { Avatar, AvatarGroup } from "@/components/ui/Avatar";
import { IconButton } from "@/components/ui/Button";
import styles from "./AssigneePicker.module.scss";

export interface AssigneeOption {
  id: string;
  name: string;
  avatarSrc?: string;
  initials?: string;
  roleLabel?: string;
  disabled?: boolean;
}

export interface AssigneePickerProps {
  assignees: AssigneeOption[];
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
  /** Max avatars shown in the selected AvatarGroup before an overflow count. */
  maxVisibleAvatars?: number;
  className?: string;
}

export function AssigneePicker({
  assignees,
  selectedIds,
  onSelectionChange,
  multiple = false,
  searchable = true,
  disabled = false,
  placeholder = "Select assignee",
  searchPlaceholder = "Search assignees\u2026",
  emptyText = "No assignees found",
  label,
  helperText,
  ariaLabel = "Assignees",
  maxVisibleAvatars = 5,
  className,
}: AssigneePickerProps) {
  const [query, setQuery] = useState("");

  const selectedAssignees = useMemo(
    () =>
      selectedIds
        .map((id) => assignees.find((a) => a.id === id))
        .filter((a): a is AssigneeOption => a != null),
    [assignees, selectedIds],
  );

  const filteredAssignees = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return assignees;
    return assignees.filter((a) => a.name.toLowerCase().includes(normalized));
  }, [assignees, query]);

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

  // ---- Single-select: delegate to Combobox ----
  if (!multiple) {
    const options = assignees.map((a) => ({
      value: a.id,
      label: a.roleLabel ? `${a.name} \u00b7 ${a.roleLabel}` : a.name,
      disabled: a.disabled,
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
        {selectedAssignees.length > 0 && (
          <div className={styles.selectedRow}>
            <Avatar
              src={selectedAssignees[0].avatarSrc}
              name={selectedAssignees[0].initials ?? selectedAssignees[0].name}
              alt={selectedAssignees[0].name}
              size="sm"
            />
            <span className={styles.selectedName}>
              {selectedAssignees[0].name}
              {selectedAssignees[0].roleLabel && (
                <span className={styles.selectedRole}>
                  {selectedAssignees[0].roleLabel}
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

      {selectedAssignees.length > 0 && (
        <div className={styles.chips}>
          <AvatarGroup max={maxVisibleAvatars}>
            {selectedAssignees.map((a) => (
              <Avatar
                key={a.id}
                src={a.avatarSrc}
                name={a.initials ?? a.name}
                alt={a.name}
                size="sm"
              />
            ))}
          </AvatarGroup>
          <ul className={styles.chipList} aria-label="Selected assignees">
            {selectedAssignees.map((a) => (
              <li key={a.id} className={styles.chip}>
                <Avatar
                  src={a.avatarSrc}
                  name={a.initials ?? a.name}
                  alt={a.name}
                  size="sm"
                />
                <span className={styles.chipName}>{a.name}</span>
                {!disabled && (
                  <IconButton
                    variant="ghost"
                    size="sm"
                    label={`Remove ${a.name}`}
                    onClick={() => removeSelected(a.id)}
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
        <div className={styles.search}>
          <Search className={styles.searchIcon} aria-hidden="true" />
          <input
            type="search"
            value={query}
            placeholder={searchPlaceholder}
            disabled={disabled}
            aria-label={ariaLabel}
            className={styles.searchInput}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      )}

      <ul className={styles.list} role="group" aria-label={ariaLabel}>
        {filteredAssignees.length === 0 ? (
          <li className={styles.empty}>{emptyText}</li>
        ) : (
          filteredAssignees.map((a) => {
            const isSelected = selectedIds.includes(a.id);
            return (
              <li key={a.id} className={styles.option}>
                <Checkbox
                  checked={isSelected}
                  disabled={disabled || a.disabled}
                  label={
                    <span className={styles.optionContent}>
                      <Avatar
                        src={a.avatarSrc}
                        name={a.initials ?? a.name}
                        alt={a.name}
                        size="sm"
                      />
                      <span className={styles.optionText}>
                        <span className={styles.optionName}>{a.name}</span>
                        {a.roleLabel && (
                          <span className={styles.optionRole}>{a.roleLabel}</span>
                        )}
                      </span>
                    </span>
                  }
                  onChange={() => toggle(a.id)}
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
