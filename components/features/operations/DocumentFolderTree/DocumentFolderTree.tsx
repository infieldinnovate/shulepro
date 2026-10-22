"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Folder, FolderOpen, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { EmptyState } from "../../../ui/EmptyState";
import { Spinner } from "../../../ui/Spinner";
import type { DocumentFolderNode } from "../types";
import styles from "./DocumentFolderTree.module.scss";

export interface DocumentFolderTreeProps {
  folders: DocumentFolderNode[];
  selectedFolderId?: string | null;
  onSelectFolder: (folderId: string) => void;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

interface FlatNode {
  node: DocumentFolderNode;
  level: number;
  expanded: boolean;
  parentPath: string[];
}

function flattenTree(
  nodes: DocumentFolderNode[],
  expandedIds: Set<string>,
  level: number,
  parentPath: string[],
): FlatNode[] {
  const result: FlatNode[] = [];
  for (const node of nodes) {
    const hasChildren = node.children && node.children.length > 0;
    const expanded = expandedIds.has(node.id);
    result.push({ node, level, expanded, parentPath });
    if (hasChildren && expanded) {
      result.push(
        ...flattenTree(
          node.children!,
          expandedIds,
          level + 1,
          [...parentPath, node.name],
        ),
      );
    }
  }
  return result;
}

export function DocumentFolderTree({
  folders,
  selectedFolderId = null,
  onSelectFolder,
  loading = false,
  emptyTitle = "No folders",
  emptyDescription = "Folders will appear here once documents are organised.",
  className,
}: DocumentFolderTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const itemRefs = useRef<Map<string, HTMLLIElement>>(new Map());

  const flatNodes = useMemo(
    () => flattenTree(folders, expandedIds, 0, []),
    [folders, expandedIds],
  );

  const focusItem = useCallback((folderId: string) => {
    const el = itemRefs.current.get(folderId);
    el?.focus();
  }, []);

  const toggleExpand = useCallback((folderId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  }, []);

  const handleItemClick = useCallback(
    (node: DocumentFolderNode) => {
      onSelectFolder(node.id);
      const hasChildren = node.children && node.children.length > 0;
      if (hasChildren && !expandedIds.has(node.id)) {
        toggleExpand(node.id);
      }
    },
    [onSelectFolder, expandedIds, toggleExpand],
  );

  const handleItemKeyDown = useCallback(
    (e: KeyboardEvent<HTMLLIElement>, flatNode: FlatNode, index: number) => {
      const node = flatNode.node;
      const hasChildren = node.children && node.children.length > 0;

      switch (e.key) {
        case "Enter":
        case " ":
          e.preventDefault();
          handleItemClick(node);
          break;
        case "ArrowRight":
          e.preventDefault();
          if (hasChildren && !expandedIds.has(node.id)) {
            toggleExpand(node.id);
          } else if (hasChildren && expandedIds.has(node.id)) {
            const next = flatNodes[index + 1];
            if (next) focusItem(next.node.id);
          }
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (hasChildren && expandedIds.has(node.id)) {
            toggleExpand(node.id);
          } else if (flatNode.level > 0) {
            let parentIndex = index - 1;
            while (parentIndex >= 0 && flatNodes[parentIndex].level >= flatNode.level) {
              parentIndex--;
            }
            if (parentIndex >= 0) {
              focusItem(flatNodes[parentIndex].node.id);
            }
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          if (index < flatNodes.length - 1) {
            focusItem(flatNodes[index + 1].node.id);
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          if (index > 0) {
            focusItem(flatNodes[index - 1].node.id);
          }
          break;
        case "Home":
          e.preventDefault();
          if (flatNodes.length > 0) focusItem(flatNodes[0].node.id);
          break;
        case "End":
          e.preventDefault();
          if (flatNodes.length > 0) {
            focusItem(flatNodes[flatNodes.length - 1].node.id);
          }
          break;
      }
    },
    [flatNodes, expandedIds, toggleExpand, handleItemClick, focusItem],
  );

  if (loading) {
    return (
      <div className={clsx(styles.container, className)}>
        <div className={styles.loadingState}>
          <Spinner size="md" label="Loading folders" />
        </div>
      </div>
    );
  }

  if (folders.length === 0) {
    return (
      <div className={clsx(styles.container, className)}>
        <EmptyState
          icon={<Folder aria-hidden="true" />}
          title={emptyTitle}
          description={emptyDescription}
        />
      </div>
    );
  }

  return (
    <div className={clsx(styles.container, className)}>
      <ul
        role="tree"
        aria-label="Document folders"
        className={styles.tree}
      >
        {flatNodes.map((flatNode, index) => {
          const { node, level, expanded } = flatNode;
          const hasChildren = node.children && node.children.length > 0;
          const isSelected = selectedFolderId === node.id;
          return (
            <li
              key={node.id}
              ref={(el) => {
                if (el) itemRefs.current.set(node.id, el);
              }}
              role="treeitem"
              aria-level={level + 1}
              aria-expanded={hasChildren ? expanded : undefined}
              aria-selected={isSelected}
              tabIndex={isSelected ? 0 : -1}
              className={clsx(
                styles.treeItem,
                isSelected && styles.selected,
              )}
              style={{ "--tree-level": level } as React.CSSProperties}
              onClick={() => handleItemClick(node)}
              onKeyDown={(e) => handleItemKeyDown(e, flatNode, index)}
            >
              <span className={styles.itemContent}>
                {hasChildren ? (
                  <button
                    type="button"
                    className={styles.expandButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(node.id);
                    }}
                    tabIndex={-1}
                    aria-label={expanded ? "Collapse folder" : "Expand folder"}
                  >
                    <ChevronRight
                      className={clsx(
                        styles.chevron,
                        expanded && styles.chevronExpanded,
                      )}
                      aria-hidden="true"
                    />
                  </button>
                ) : (
                  <span className={styles.expandPlaceholder} aria-hidden="true" />
                )}
                {expanded && hasChildren ? (
                  <FolderOpen className={styles.folderIcon} aria-hidden="true" />
                ) : (
                  <Folder className={styles.folderIcon} aria-hidden="true" />
                )}
                <span className={styles.folderName}>{node.name}</span>
                {typeof node.documentCount === "number" && (
                  <span className={styles.docCount}>{node.documentCount}</span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
