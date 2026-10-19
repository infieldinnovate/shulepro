"use client";

import { useCallback, useId, useMemo } from "react";
import { Check, Save, Trash as Trash2, Star } from "lucide-react";
import type { DropdownMenuItem } from "../../ui/DropdownMenu";
import { DropdownMenu } from "../../ui/DropdownMenu";

export interface SavedView {
  id: string;
  name: string;
  isDefault?: boolean;
}

export interface SavedViewSelectorProps {
  views: SavedView[];
  currentViewId?: string;
  onApply: (viewId: string) => void;
  onSave?: () => void;
  onDelete?: (viewId: string) => void;
  saveLabel?: string;
  deleteLabel?: string;
  defaultLabel?: string;
  triggerLabel?: string;
  ariaLabel?: string;
  className?: string;
}

export function SavedViewSelector({
  views,
  currentViewId,
  onApply,
  onSave,
  onDelete,
  saveLabel = "Save current view",
  deleteLabel = "Delete",
  defaultLabel = "Default",
  triggerLabel = "Views",
  ariaLabel = "Saved views",
  className,
}: SavedViewSelectorProps) {
  const generatedId = useId();
  const groupKey = `${generatedId}-group`;

  const currentView = useMemo(
    () => views.find((v) => v.id === currentViewId) ?? null,
    [views, currentViewId],
  );

  const handleRadioChange = useCallback(
    (_group: string, value: string) => {
      onApply(value);
    },
    [onApply],
  );

  const items = useMemo<DropdownMenuItem[]>(() => {
    const viewItems: DropdownMenuItem[] = views.map((view) => ({
      type: "radioItem",
      radioGroup: groupKey,
      value: view.id,
      label: view.isDefault ? `${view.name} (${defaultLabel})` : view.name,
      icon: view.isDefault ? (
        <Star size={14} aria-hidden="true" />
      ) : (
        <Check size={14} aria-hidden="true" />
      ),
      onSelect: () => onApply(view.id),
    }));

    const extra: DropdownMenuItem[] = [];
    if (onSave) {
      extra.push({ type: "divider" });
      extra.push({
        type: "item",
        label: saveLabel,
        icon: <Save size={14} aria-hidden="true" />,
        onSelect: onSave,
      });
    }
    if (onDelete && currentView) {
      extra.push({
        type: "item",
        label: `${deleteLabel} \u201C${currentView.name}\u201D`,
        icon: <Trash2 size={14} aria-hidden="true" />,
        onSelect: () => onDelete(currentView.id),
      });
    }

    return [...viewItems, ...extra];
  }, [
    views,
    groupKey,
    defaultLabel,
    onApply,
    onSave,
    onDelete,
    currentView,
    saveLabel,
    deleteLabel,
  ]);

  const triggerLabelResolved = currentView
    ? currentView.name
    : triggerLabel;

  return (
    <DropdownMenu
      items={items}
      triggerLabel={triggerLabelResolved}
      align="start"
      ariaLabel={ariaLabel}
      radioValues={{ [groupKey]: currentViewId ?? "" }}
      onRadioValueChange={handleRadioChange}
      className={className}
    />
  );
}
