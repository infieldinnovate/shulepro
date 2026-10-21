"use client";

import { useMemo } from "react";
import type { ReactNode } from "react";
import { Compass } from "lucide-react";
import clsx from "clsx";
import { SearchInput } from "../../../shared/SearchInput";
import { FilterBar } from "../../../shared/FilterBar";
import { Select } from "../../../ui/Select";
import { Spinner } from "../../../ui/Spinner";
import { Alert } from "../../../ui/Alert";
import { EmptyState } from "../../../ui/EmptyState";
import { CareerClusterCard } from "../CareerClusterCard";
import type {
  CareerCluster,
  CareerExplorerFacet,
  CareerExplorerFilters,
} from "../types";
import styles from "./CareerExplorer.module.scss";

export interface CareerExplorerProps {
  /** Configurable career clusters to explore. */
  clusters: CareerCluster[];
  /** Configurable filter facets (cluster, interest, learning area, etc.). */
  facets: CareerExplorerFacet[];
  /** Current search query (controlled). */
  searchQuery: string;
  /** Called when the search query changes. */
  onSearchChange: (value: string) => void;
  /** Active filter values keyed by facet key (controlled). */
  filters: CareerExplorerFilters;
  /** Called when a filter value changes (key + value). */
  onFilterChange: (facetKey: string, value: string) => void;
  /** Called when the user resets all filters. */
  onReset: () => void;
  /** Called when a cluster card is selected. */
  onSelectCluster?: (cluster: CareerCluster) => void;
  /** Optional title for the explorer. */
  title?: string;
  /** Optional description shown under the title. */
  description?: string;
  loading?: boolean;
  error?: string;
  /** Optional content rendered below the grid (e.g. pagination). */
  children?: ReactNode;
  className?: string;
}

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

function matchesSearch(cluster: CareerCluster, query: string): boolean {
  const q = normalize(query);
  if (q === "") return true;
  if (normalize(cluster.label).includes(q)) return true;
  if (cluster.description && normalize(cluster.description).includes(q)) return true;
  if (cluster.occupations.some((o) => normalize(o.label).includes(q))) return true;
  if (cluster.learningAreas.some((la) => normalize(la.label).includes(q))) return true;
  if (cluster.interests.some((i) => normalize(i.label).includes(q))) return true;
  return false;
}

function matchesFilters(
  cluster: CareerCluster,
  filters: CareerExplorerFilters,
  facets: CareerExplorerFacet[],
): boolean {
  for (const facet of facets) {
    const value = filters[facet.key];
    if (!value) continue;
    // Try to match the facet value against the cluster's related refs/labels.
    if (facet.key === "cluster") {
      if (cluster.key !== value) return false;
      continue;
    }
    if (facet.key === "interest") {
      if (!cluster.interests.some((i) => i.dimensionKey === value)) return false;
      continue;
    }
    if (facet.key === "learningArea") {
      if (!cluster.learningAreas.some((la) => la.ref === value)) return false;
      continue;
    }
    // Generic fallback: match against any label/ref in the cluster.
    const labels = [
      cluster.label,
      cluster.description ?? "",
      ...cluster.learningAreas.map((la) => la.label),
      ...cluster.interests.map((i) => i.label),
      ...cluster.occupations.map((o) => o.label),
    ];
    if (!labels.some((l) => normalize(l).includes(normalize(value)))) return false;
  }
  return true;
}

export function CareerExplorer({
  clusters,
  facets,
  searchQuery,
  onSearchChange,
  filters,
  onFilterChange,
  onReset,
  onSelectCluster,
  title = "Career explorer",
  description,
  loading = false,
  error,
  children,
  className,
}: CareerExplorerProps) {
  const visibleClusters = useMemo(
    () =>
      clusters.filter(
        (cluster) =>
          matchesSearch(cluster, searchQuery) &&
          matchesFilters(cluster, filters, facets),
      ),
    [clusters, searchQuery, filters, facets],
  );

  if (loading) {
    return (
      <div className={clsx(styles.container, className)}>
        <div className={styles.loadingState}>
          <Spinner size="md" label="Loading career explorer" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={clsx(styles.container, className)}>
        <Alert
          variant="error"
          title="Unable to load career explorer"
          description={error}
        />
      </div>
    );
  }

  const hasFilters = facets.length > 0 || searchQuery.length > 0;
  const resultCount = `${visibleClusters.length} cluster${
    visibleClusters.length === 1 ? "" : "s"
  }`;

  return (
    <div className={clsx(styles.container, className)}>
      {(title || description) && (
        <div className={styles.header}>
          {title && <h3 className={styles.title}>{title}</h3>}
          {description && (
            <p className={styles.description}>{description}</p>
          )}
        </div>
      )}

      <FilterBar
        search={
          <SearchInput
            value={searchQuery}
            onValueChange={onSearchChange}
            placeholder="Search clusters, occupations, learning areas..."
            ariaLabel="Search career clusters"
          />
        }
        filters={
          facets.length > 0 ? (
            <div className={styles.filterControls}>
              {facets.map((facet) => (
                <Select
                  key={facet.key}
                  id={`filter-${facet.key}`}
                  options={facet.options}
                  placeholder={facet.label}
                  value={filters[facet.key] ?? ""}
                  onChange={(e) => onFilterChange(facet.key, e.target.value)}
                  className={styles.filterSelect}
                />
              ))}
            </div>
          ) : undefined
        }
        onReset={hasFilters ? onReset : undefined}
        resultCount={resultCount}
      />

      {visibleClusters.length === 0 ? (
        <EmptyState
          icon={<Compass aria-hidden="true" />}
          title="No matching clusters"
          description="Try adjusting your search or filters to see more career clusters."
        />
      ) : (
        <div className={styles.grid}>
          {visibleClusters.map((cluster) => (
            <CareerClusterCard
              key={cluster.id}
              cluster={cluster}
              onSelect={onSelectCluster}
            />
          ))}
        </div>
      )}

      {children}
    </div>
  );
}
