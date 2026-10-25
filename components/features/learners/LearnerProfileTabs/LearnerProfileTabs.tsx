import { LayoutPanelTop } from "lucide-react";
import clsx from "clsx";
import { Tabs } from "@/components/ui/Tabs";
import type { TabItem } from "@/components/ui/Tabs";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import styles from "./LearnerProfileTabs.module.scss";

export interface LearnerProfileTabsProps {
  tabs: TabItem[];
  defaultIndex?: number;
  /** Controlled selected index (0-based). */
  selectedIndex?: number;
  onSelect?: (index: number) => void;
  ariaLabel?: string;
  loading?: boolean;
  error?: string;
  /** Title/description for the empty state when no tabs are provided. */
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

export function LearnerProfileTabs({
  tabs,
  defaultIndex,
  selectedIndex,
  onSelect,
  ariaLabel = "Learner profile",
  loading = false,
  error,
  emptyTitle = "No profile sections",
  emptyDescription = "There are no tabs configured for this learner profile.",
  className,
}: LearnerProfileTabsProps) {
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

  return (
    <Tabs
      items={tabs}
      defaultIndex={defaultIndex}
      selectedIndex={selectedIndex}
      onSelect={onSelect}
      ariaLabel={ariaLabel}
      className={clsx(styles.tabs, className)}
    />
  );
}
