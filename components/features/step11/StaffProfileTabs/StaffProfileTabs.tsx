import type { ReactNode } from "react";
import clsx from "clsx";
import { Tabs } from "../../../ui/Tabs";
import type { TabItem } from "../../../ui/Tabs";
import { Spinner } from "../../../ui/Spinner";
import { Alert } from "../../../ui/Alert";
import { EmptyState } from "../../../ui/EmptyState";
import { LayoutPanelTop } from "lucide-react";
import type { ProfileTab } from "../models";
import styles from "./StaffProfileTabs.module.scss";

export interface StaffProfileTabsProps {
  /**
   * Configurable profile tabs. Each tab's `id` and `label` come from
   * the ProfileTab model; the caller supplies the tab content via
   * the `content` map keyed by tab id.
   */
  tabs: ProfileTab[];
  /** Tab content, keyed by ProfileTab.id. */
  content: Record<string, ReactNode>;
  /** Controlled active tab id. */
  activeTabId?: string;
  /** Default active tab id for uncontrolled usage. */
  defaultTabId?: string;
  /** Callback fired when the active tab changes. */
  onTabChange?: (tabId: string) => void;
  /** Accessible label for the tablist. */
  ariaLabel?: string;
  /** Loading state — shows a spinner. */
  loading?: boolean;
  /** Error message — shows an error alert. */
  error?: string;
  /** Title/description for the empty state when no tabs are configured. */
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

export function StaffProfileTabs({
  tabs,
  content,
  activeTabId,
  defaultTabId,
  onTabChange,
  ariaLabel = "Staff profile",
  loading = false,
  error,
  emptyTitle = "No profile sections",
  emptyDescription = "There are no tabs configured for this staff profile.",
  className,
}: StaffProfileTabsProps) {
  if (loading) {
    return (
      <div className={clsx(styles.loading, className)}>
        <Spinner size="md" label="Loading profile" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        variant="error"
        title="Unable to load profile"
        description={error}
        className={className}
      />
    );
  }

  if (tabs.length === 0) {
    return (
      <EmptyState
        icon={<LayoutPanelTop aria-hidden="true" />}
        title={emptyTitle}
        description={emptyDescription}
        className={className}
      />
    );
  }

  const tabItems: TabItem[] = tabs.map((tab) => ({
    id: tab.id,
    label: tab.label,
    content: content[tab.id] ?? null,
    disabled: tab.disabled,
  }));

  const defaultIndex = (() => {
    if (defaultTabId) {
      const idx = tabs.findIndex((t) => t.id === defaultTabId && !t.disabled);
      if (idx >= 0) return idx;
    }
    return 0;
  })();

  const selectedIndex = (() => {
    if (!activeTabId) return undefined;
    return Math.max(0, tabs.findIndex((t) => t.id === activeTabId));
  })();

  return (
    <Tabs
      items={tabItems}
      defaultIndex={defaultIndex}
      selectedIndex={selectedIndex}
      onSelect={(index) => {
        const tab = tabs[index];
        if (tab) onTabChange?.(tab.id);
      }}
      ariaLabel={ariaLabel}
      className={clsx(styles.tabs, className)}
    />
  );
}
