"use client";

import { useState, useMemo } from "react";
import type { ReactNode } from "react";
import {
  File as FileIcon,
  FileText,
  FileImage,
  FileSpreadsheet,
  FileArchive,
  FileVideo,
  FileAudio,
} from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Tabs } from "@/components/ui/Tabs";
import type { EvidenceItem } from "@/components/features/assessment/types";
import styles from "./PortfolioGallery.module.scss";

export type PortfolioGroupBy = "learning-area" | "type" | "date" | "activity" | "none";

export interface PortfolioGalleryProps {
  evidenceItems: EvidenceItem[];
  title?: ReactNode;
  onSelectEvidence?: (item: EvidenceItem) => void;
  groupBy?: PortfolioGroupBy;
  /** Responsive column count: base, then sm, md, lg. */
  columns?: { base: number; sm?: number; md?: number; lg?: number };
  loading?: boolean;
  error?: ReactNode;
  empty?: boolean;
  className?: string;
}

function iconForType(type?: string): ReactNode {
  if (!type) return <FileIcon aria-hidden="true" />;
  const t = type.toLowerCase();
  if (t.startsWith("image/")) return <FileImage aria-hidden="true" />;
  if (t.startsWith("video/")) return <FileVideo aria-hidden="true" />;
  if (t.startsWith("audio/")) return <FileAudio aria-hidden="true" />;
  if (t.startsWith("text/") || t.includes("pdf") || t.includes("word"))
    return <FileText aria-hidden="true" />;
  if (t.includes("sheet") || t.includes("excel") || t.includes("csv"))
    return <FileSpreadsheet aria-hidden="true" />;
  if (t.includes("zip") || t.includes("compressed"))
    return <FileArchive aria-hidden="true" />;
  return <FileIcon aria-hidden="true" />;
}

function formatDate(date: Date | string | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "";
  return format(d, "MMM d, yyyy");
}

function getGroupKey(
  item: EvidenceItem,
  groupBy: PortfolioGroupBy,
): string {
  switch (groupBy) {
    case "learning-area":
      return item.learningAreaRef ?? "Uncategorized";
    case "type":
      return item.type ?? "Other";
    case "date":
      return formatDate(item.uploadedAt);
    case "activity":
      return item.learningAreaRef ?? "Uncategorized";
    case "none":
    default:
      return "All evidence";
  }
}

export function PortfolioGallery({
  evidenceItems,
  title,
  onSelectEvidence,
  groupBy = "none",
  columns = { base: 1, sm: 2, md: 3, lg: 3 },
  loading = false,
  error,
  empty = false,
  className,
}: PortfolioGalleryProps) {
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<string, EvidenceItem[]>();
    for (const item of evidenceItems) {
      const key = getGroupKey(item, groupBy);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return Array.from(map.entries());
  }, [evidenceItems, groupBy]);

  if (loading) {
    return (
      <div className={clsx(styles.container, className)}>
        <div className={styles.loadingState}>
          <Spinner size="md" label="Loading portfolio" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={clsx(styles.container, className)}>
        <Alert
          variant="error"
          title="Unable to load portfolio"
          description={error}
        />
      </div>
    );
  }

  if (empty || evidenceItems.length === 0) {
    return (
      <div className={clsx(styles.container, className)}>
        <EmptyState
          icon={<FileImage aria-hidden="true" />}
          title="No evidence in portfolio"
          description="Evidence collected from assessments will appear here."
        />
      </div>
    );
  }

  const renderGroupSection = (groupKey: string, items: EvidenceItem[]) => (
    <div key={groupKey} className={styles.groupSection}>
      {groupBy !== "none" && <h4 className={styles.groupTitle}>{groupKey}</h4>}
      <div
        className={styles.grid}
        style={{
          "--cols-base": columns.base,
          "--cols-sm": columns.sm ?? columns.base,
          "--cols-md": columns.md ?? columns.sm ?? columns.base,
          "--cols-lg": columns.lg ?? columns.md ?? columns.sm ?? columns.base,
        } as React.CSSProperties}
      >
        {items.map((item) => {
          const interactive = Boolean(onSelectEvidence);
          return (
            <Card
              key={item.id}
              padded
              className={clsx(
                styles.card,
                interactive && styles.interactive,
              )}
              role={interactive ? "button" : undefined}
              tabIndex={interactive ? 0 : undefined}
              onClick={interactive ? () => onSelectEvidence?.(item) : undefined}
              onKeyDown={
                interactive
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelectEvidence?.(item);
                      }
                    }
                  : undefined
              }
              aria-label={interactive ? `View evidence: ${item.name}` : undefined}
            >
              <div className={styles.cardIcon}>
                {iconForType(item.type)}
              </div>
              <div className={styles.cardBody}>
                <span className={styles.cardName}>{item.name}</span>
                {item.caption && (
                  <span className={styles.cardCaption}>{item.caption}</span>
                )}
                <div className={styles.cardMeta}>
                  {item.type && (
                    <Badge variant="neutral" size="sm">
                      {item.type}
                    </Badge>
                  )}
                  {item.uploadedAt && (
                    <span className={styles.cardDate}>
                      {formatDate(item.uploadedAt)}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className={clsx(styles.container, className)}>
      {title && <h3 className={styles.title}>{title}</h3>}

      {groupBy !== "none" && grouped.length > 1 ? (
        <Tabs
          ariaLabel="Filter by group"
          selectedIndex={
            activeGroup === null
              ? 0
              : Math.max(
                  0,
                  grouped.findIndex(([key]) => key === activeGroup) + 1,
                )
          }
          onSelect={(index) => {
            if (index === 0) {
              setActiveGroup(null);
            } else {
              setActiveGroup(grouped[index - 1]?.[0] ?? null);
            }
          }}
          items={[
            {
              label: `All (${evidenceItems.length})`,
              content: grouped.map(([key, items]) =>
                renderGroupSection(key, items),
              ),
            },
            ...grouped.map(([key, items]) => ({
              id: key,
              label: `${key} (${items.length})`,
              content: renderGroupSection(key, items),
            })),
          ]}
        />
      ) : (
        grouped.map(([groupKey, items]) => renderGroupSection(groupKey, items))
      )}
    </div>
  );
}
