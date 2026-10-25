import type { ReactNode } from "react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Library,
  ExternalLink,
  FileText,
  Video,
  BookOpen,
  Users,
  Globe,
} from "lucide-react";

/* eslint-disable @next/next/no-img-element */
import type { ResourceLibraryResource, DisabledState } from "@/components/features/engagement/models";
import styles from "./ResourceLibraryCard.module.scss";

export interface ResourceLibraryCardProps {
  /** The resource data — all metadata supplied via props. */
  resource?: ResourceLibraryResource | null;
  /** Optional action slot (e.g. download or share button). */
  actions?: ReactNode;
  /** Loading state — shows a spinner. */
  loading?: boolean;
  /** Empty state — shows placeholder. */
  empty?: boolean;
  /** Disabled state — dims the card. */
  disabled?: DisabledState;
  className?: string;
}

const TYPE_ICON: Record<string, ReactNode> = {
  Video: <Video aria-hidden="true" />,
  Article: <FileText aria-hidden="true" />,
  Guide: <BookOpen aria-hidden="true" />,
};

export function ResourceLibraryCard({
  resource,
  actions,
  loading = false,
  empty = false,
  disabled,
  className,
}: ResourceLibraryCardProps) {
  if (loading) {
    return (
      <Card padded className={clsx(styles.loading, className)}>
        <Spinner size="md" label="Loading resource" />
      </Card>
    );
  }

  if (empty || !resource) {
    return (
      <Card padded className={clsx(styles.empty, className)}>
        <EmptyState
          icon={<Library aria-hidden="true" />}
          title="No resource"
          description="No resource to display."
        />
      </Card>
    );
  }

  const isDisabled = Boolean(disabled?.disabled);
  const typeIcon = resource.type ? TYPE_ICON[resource.type] ?? <Library aria-hidden="true" /> : <Library aria-hidden="true" />;

  return (
    <Card
      padded={false}
      className={clsx(
        styles.card,
        isDisabled && styles.disabled,
        className,
      )}
      aria-disabled={isDisabled || undefined}
    >
      <div className={styles.body}>
        <div className={styles.header}>
          <span className={styles.typeIcon}>{typeIcon}</span>
          <div className={styles.headerInfo}>
            <h3 className={styles.title}>{resource.title}</h3>
            {resource.type && (
              <Badge variant="neutral" size="sm">
                {resource.type}
              </Badge>
            )}
          </div>
        </div>

        {resource.thumbnail && (
          <div className={styles.thumbnail}>
            <img
              src={resource.thumbnail}
              alt=""
              loading="lazy"
              className={styles.thumbnailImg}
            />
          </div>
        )}

        {resource.description && (
          <p className={styles.description}>{resource.description}</p>
        )}

        <div className={styles.meta}>
          {resource.category && (
            <span className={styles.metaItem}>
              <BookOpen aria-hidden="true" />
              <span>{resource.category}</span>
            </span>
          )}
          {resource.audience && (
            <span className={styles.metaItem}>
              <Users aria-hidden="true" />
              <span>{resource.audience}</span>
            </span>
          )}
          {resource.language && (
            <span className={styles.metaItem}>
              <Globe aria-hidden="true" />
              <span>{resource.language}</span>
            </span>
          )}
        </div>

        {isDisabled && disabled?.disabledReason && (
          <p className={styles.disabledReason}>{disabled.disabledReason}</p>
        )}
      </div>

      {(actions || resource.url) && (
        <div className={styles.footer}>
          {resource.url && !isDisabled && (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              <ExternalLink aria-hidden="true" />
              <span>Open resource</span>
            </a>
          )}
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      )}
    </Card>
  );
}