"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { ChevronRight, Search, FileText, FolderOpen, Folder } from "lucide-react";
import clsx from "clsx";
import { Spinner } from "../../../ui/Spinner";
import { Alert } from "../../../ui/Alert";
import { EmptyState } from "../../../ui/EmptyState";
import type { CurriculumNode, CurriculumNodeType } from "../types";
import styles from "./CurriculumTree.module.scss";

export interface CurriculumTreeProps {
  nodes: CurriculumNode[];
  selectedNodeId?: string;
  onSelectNode?: (node: CurriculumNode) => void;
  /** Initially expanded node IDs (uncontrolled). */
  defaultExpandedIds?: string[];
  /** Controlled expanded node IDs. */
  expandedIds?: string[];
  onExpandedChange?: (ids: string[]) => void;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  searchable?: boolean;
  onSearch?: (query: string) => void;
  /** Accessible label for the tree. */
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
}

interface FlatNode {
  node: CurriculumNode;
  depth: number;
  parentId: string | null;
  hasChildren: boolean;
}

const TYPE_ICONS: Partial<Record<CurriculumNodeType, ReactNode>> = {
  subject: <Folder aria-hidden="true" />,
  strand: <Folder aria-hidden="true" />,
  "sub-strand": <FolderOpen aria-hidden="true" />,
  outcome: <FileText aria-hidden="true" />,
  topic: <Folder aria-hidden="true" />,
  other: <FileText aria-hidden="true" />,
};

function flattenNodes(
  nodes: CurriculumNode[],
  depth: number,
  parentId: string | null,
  expandedSet: Set<string>,
  query: string,
  out: FlatNode[],
): void {
  const normalized = query.trim().toLowerCase();
  for (const node of nodes) {
    const matches =
      !normalized ||
      node.label.toLowerCase().includes(normalized) ||
      (node.code?.toLowerCase().includes(normalized) ?? false) ||
      (node.description?.toLowerCase().includes(normalized) ?? false);

    const childMatches = normalized
      ? nodeHasMatchInDescendants(node, normalized)
      : false;

    const shouldShow = !normalized || matches || childMatches;
    const isExpanded = expandedSet.has(node.id);

    if (shouldShow) {
      out.push({
        node,
        depth,
        parentId,
        hasChildren: Boolean(node.children && node.children.length > 0),
      });
    }

    if (
      node.children &&
      node.children.length > 0 &&
      (shouldShow || childMatches) &&
      (isExpanded || normalized)
    ) {
      flattenNodes(node.children, depth + 1, node.id, expandedSet, query, out);
    }
  }
}

function nodeHasMatchInDescendants(node: CurriculumNode, query: string): boolean {
  if (!node.children) return false;
  for (const child of node.children) {
    if (
      child.label.toLowerCase().includes(query) ||
      (child.code?.toLowerCase().includes(query) ?? false) ||
      (child.description?.toLowerCase().includes(query) ?? false) ||
      nodeHasMatchInDescendants(child, query)
    ) {
      return true;
    }
  }
  return false;
}

export function CurriculumTree({
  nodes,
  selectedNodeId,
  onSelectNode,
  defaultExpandedIds = [],
  expandedIds,
  onExpandedChange,
  loading = false,
  error,
  empty = false,
  searchable = false,
  onSearch,
  ariaLabel = "Curriculum tree",
  disabled = false,
  className,
}: CurriculumTreeProps) {
  const [internalExpanded, setInternalExpanded] = useState<Set<string>>(
    () => new Set(defaultExpandedIds),
  );
  const [query, setQuery] = useState("");
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  const isControlled = Array.isArray(expandedIds);
  const expandedSet = useMemo(
    () => (isControlled ? new Set(expandedIds!) : internalExpanded),
    [isControlled, expandedIds, internalExpanded],
  );

  const notifyExpanded = useCallback(
    (next: Set<string>) => {
      if (!isControlled) setInternalExpanded(next);
      onExpandedChange?.(Array.from(next));
    },
    [isControlled, onExpandedChange],
  );

  const toggleExpand = useCallback(
    (nodeId: string) => {
      if (disabled) return;
      const next = new Set(expandedSet);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      notifyExpanded(next);
    },
    [disabled, expandedSet, notifyExpanded],
  );

  const flatNodes = useMemo(() => {
    const out: FlatNode[] = [];
    flattenNodes(nodes, 0, null, expandedSet, query, out);
    return out;
  }, [nodes, expandedSet, query]);

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);
      onSearch?.(value);
    },
    [onSearch],
  );

  const focusItem = useCallback((index: number) => {
    itemRefs.current[index]?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>, index: number) => {
      if (disabled) return;
      const item = flatNodes[index];
      if (!item) return;

      switch (event.key) {
        case "ArrowDown": {
          event.preventDefault();
          const next = index + 1;
          if (next < flatNodes.length) focusItem(next);
          break;
        }
        case "ArrowUp": {
          event.preventDefault();
          const prev = index - 1;
          if (prev >= 0) focusItem(prev);
          break;
        }
        case "ArrowRight": {
          event.preventDefault();
          if (item.hasChildren && !expandedSet.has(item.node.id)) {
            toggleExpand(item.node.id);
          } else if (item.hasChildren && expandedSet.has(item.node.id)) {
            const childIdx = index + 1;
            if (childIdx < flatNodes.length) focusItem(childIdx);
          }
          break;
        }
        case "ArrowLeft": {
          event.preventDefault();
          if (item.hasChildren && expandedSet.has(item.node.id)) {
            toggleExpand(item.node.id);
          } else if (item.parentId) {
            const parentIdx = flatNodes.findIndex(
              (fn) => fn.node.id === item.parentId,
            );
            if (parentIdx >= 0) focusItem(parentIdx);
          }
          break;
        }
        case "Home": {
          event.preventDefault();
          focusItem(0);
          break;
        }
        case "End": {
          event.preventDefault();
          focusItem(flatNodes.length - 1);
          break;
        }
        case "Enter":
        case " ": {
          event.preventDefault();
          onSelectNode?.(item.node);
          break;
        }
      }
    },
    [disabled, flatNodes, expandedSet, toggleExpand, onSelectNode, focusItem],
  );

  if (loading) {
    return (
      <div className={clsx(styles.loading, className)}>
        <Spinner size="md" label="Loading curriculum" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        variant="error"
        title="Unable to load curriculum"
        description={error}
        className={className}
      />
    );
  }

  if (empty || nodes.length === 0) {
    return (
      <EmptyState
        icon={<FileText aria-hidden="true" />}
        title="No curriculum content"
        description="There are no curriculum nodes to display."
        className={className}
      />
    );
  }

  return (
    <div className={clsx(styles.container, className)}>
      {searchable && (
        <div className={styles.search}>
          <Search className={styles.searchIcon} aria-hidden="true" />
          <input
            type="search"
            value={query}
            placeholder="Search curriculum\u2026"
            disabled={disabled}
            aria-label="Search curriculum"
            className={styles.searchInput}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      )}

      {flatNodes.length === 0 && query ? (
        <EmptyState
          title="No matching nodes"
          description="Try a different search term."
        />
      ) : (
        <div
          role="tree"
          aria-label={ariaLabel}
          className={styles.tree}
        >
          {flatNodes.map((item, index) => {
            const isExpanded = expandedSet.has(item.node.id);
            const isSelected = selectedNodeId === item.node.id;
            const icon = TYPE_ICONS[item.node.type] ?? <FileText aria-hidden="true" />;
            return (
              <div
                key={`${item.node.id}-${index}`}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                role="treeitem"
                aria-expanded={item.hasChildren ? isExpanded : undefined}
                aria-selected={isSelected || undefined}
                aria-level={item.depth + 1}
                tabIndex={isSelected || (index === 0 && !selectedNodeId) ? 0 : -1}
                className={clsx(
                  styles.item,
                  isSelected && styles.selected,
                  disabled && styles.disabled,
                )}
                style={{ "--tree-depth": item.depth } as React.CSSProperties}
                onClick={() => {
                  if (disabled) return;
                  if (item.hasChildren) toggleExpand(item.node.id);
                  onSelectNode?.(item.node);
                }}
                onKeyDown={(e) => handleKeyDown(e, index)}
              >
                <span
                  className={styles.expandIcon}
                  aria-hidden="true"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (item.hasChildren) toggleExpand(item.node.id);
                  }}
                >
                  {item.hasChildren ? (
                    <ChevronRight
                      className={clsx(
                        styles.chevron,
                        isExpanded && styles.chevronOpen,
                      )}
                    />
                  ) : null}
                </span>
                <span className={styles.nodeIcon}>{icon}</span>
                <span className={styles.nodeLabel}>
                  {item.node.code && (
                    <span className={styles.nodeCode}>{item.node.code}</span>
                  )}
                  <span className={styles.nodeText}>{item.node.label}</span>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
