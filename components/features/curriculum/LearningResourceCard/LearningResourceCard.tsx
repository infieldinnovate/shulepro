"use client";

import type { ReactNode } from "react";
import {
  BookOpen,
  FileText,
  Monitor,
  ClipboardList,
  Video,
  Headphones,
  MousePointerClick,
  File as FileIcon,
  Link as LinkIcon,
  ExternalLink,
  Download,
  Clock,
  Globe,
  GraduationCap,
} from "lucide-react";
import clsx from "clsx";
import { Card } from "../../../ui/Card";
import { Badge } from "../../../ui/Badge";
import { Spinner } from "../../../ui/Spinner";
import { Alert } from "../../../ui/Alert";
import { EmptyState } from "../../../ui/EmptyState";
import type { LearningResource, ResourceType } from "../types";
import styles from "./LearningResourceCard.module.scss";

export interface LearningResourceCardProps {
  resource: LearningResource;
  onOpen?: (resource: LearningResource) => void;
  onDownload?: (resource: LearningResource) => void;
  /** Optional action slot rendered in the footer. */
  actions?: ReactNode;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  className?: string;
}

const RESOURCE_TYPE_META: Record<
  ResourceType,
  { label: string; icon: typeof BookOpen }
> = {
  textbook: { label: "Textbook", icon: BookOpen },
  digital: { label: "Digital", icon: Monitor },
  worksheet: { label: "Worksheet", icon: ClipboardList },
  video: { label: "Video", icon: Video },
  audio: { label: "Audio", icon: Headphones },
  interactive: { label: "Interactive", icon: MousePointerClick },
  document: { label: "Document", icon: FileText },
  link: { label: "Link", icon: LinkIcon },
  other: { label: "Resource", icon: FileIcon },
};

function ResourceIcon({ type }: { type: ResourceType }) {
  const Icon = RESOURCE_TYPE_META[type]?.icon ?? FileIcon;
  return <Icon aria-hidden="true" className={styles.typeIcon} />;
}

export function LearningResourceCard({
  resource,
  onOpen,
  onDownload,
  actions,
  loading = false,
  error,
  empty = false,
  className,
}: LearningResourceCardProps) {
  if (loading) {
    return (
      <Card className={clsx(styles.card, styles.loadingCard, className)} padded>
        <div className={styles.loadingBody}>
          <Spinner size="md" label="Loading resource" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <Alert
          variant="error"
          title="Unable to load resource"
          description={error}
        />
      </Card>
    );
  }

  if (empty || !resource) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <EmptyState
          icon={<BookOpen aria-hidden="true" />}
          title="No resource"
          description="There is no learning resource to display."
        />
      </Card>
    );
  }

  const typeMeta = RESOURCE_TYPE_META[resource.type] ?? RESOURCE_TYPE_META.other;
  const interactive = Boolean(onOpen);
  const hasDownload = Boolean(onDownload || resource.url);
  const hasThumb = Boolean(resource.thumbnail);

  return (
    <Card
      className={clsx(styles.card, interactive && styles.interactive, className)}
      padded={false}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? () => onOpen?.(resource) : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpen?.(resource);
              }
            }
          : undefined
      }
      aria-label={interactive ? `Open resource: ${resource.title}` : undefined}
    >
      {/* Thumbnail or icon banner */}
      <div className={styles.thumbWrap}>
        {hasThumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resource.thumbnail}
            alt=""
            className={styles.thumbnail}
            loading="lazy"
          />
        ) : (
          <div className={styles.iconBanner}>
            <ResourceIcon type={resource.type} />
          </div>
        )}
        <span className={styles.typeBadgeWrap}>
          <Badge variant="neutral" size="sm" icon={<ResourceIcon type={resource.type} />}>
            {typeMeta.label}
          </Badge>
        </span>
      </div>

      <div className={styles.content}>
        <h4 className={styles.title}>{resource.title}</h4>

        {resource.provider && (
          <p className={styles.provider}>{resource.provider}</p>
        )}

        {resource.description && (
          <p className={styles.description}>{resource.description}</p>
        )}

        <div className={styles.metaRow}>
          {resource.duration && (
            <span className={styles.metaItem}>
              <Clock aria-hidden="true" className={styles.metaIcon} />
              {resource.duration}
            </span>
          )}
          {resource.language && (
            <span className={styles.metaItem}>
              <Globe aria-hidden="true" className={styles.metaIcon} />
              {resource.language}
            </span>
          )}
          {resource.gradeLevel && (
            <span className={styles.metaItem}>
              <GraduationCap aria-hidden="true" className={styles.metaIcon} />
              {resource.gradeLevel}
            </span>
          )}
        </div>

        {resource.learningAreaRefs && resource.learningAreaRefs.length > 0 && (
          <div className={styles.areaTags}>
            {resource.learningAreaRefs.map((ref) => (
              <span key={ref} className={styles.areaTag}>
                {ref}
              </span>
            ))}
          </div>
        )}

        {(hasDownload || onOpen || actions) && (
          <div className={styles.footer}>
            {actions}
            {onOpen && (
              <button
                type="button"
                className={styles.actionBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen(resource);
                }}
              >
                <ExternalLink aria-hidden="true" className={styles.actionIcon} />
                Open
              </button>
            )}
            {hasDownload && (
              <button
                type="button"
                className={styles.actionBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onDownload) {
                    onDownload(resource);
                  } else if (resource.url) {
                    window.open(resource.url, "_blank", "noopener,noreferrer");
                  }
                }}
              >
                <Download aria-hidden="true" className={styles.actionIcon} />
                Download
              </button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
