import type { ReactNode } from "react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { FileText, Download, ExternalLink, Calendar, Building as Building2, Tag, ClipboardList } from "lucide-react";
import type { PolicyDocument, DisabledState } from "@/components/features/engagement/models";
import { formatDate } from "@/lib/formatTime";
import styles from "./PolicyDocumentCard.module.scss";

export interface PolicyDocumentCardProps {
  /** Policy data — supplied via props. */
  policy?: PolicyDocument | null;
  /** Optional status badge slot — overrides the default. */
  status?: ReactNode;
  /** Optional action slot. */
  actions?: ReactNode;
  /** Loading state. */
  loading?: boolean;
  /** Error message. */
  error?: string;
  /** Empty state. */
  empty?: boolean;
  /** Disabled state. */
  disabled?: DisabledState;
  className?: string;
}

const STATUS_VARIANT: Record<string, "success" | "warning" | "neutral"> = {
  active: "success",
  draft: "warning",
  archived: "neutral",
};

export function PolicyDocumentCard({
  policy,
  status,
  actions,
  loading = false,
  error,
  empty = false,
  disabled,
  className,
}: PolicyDocumentCardProps) {
  if (loading) {
    return (
      <Card padded className={clsx(styles.loading, className)}>
        <Spinner size="md" label="Loading policy" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card padded className={className}>
        <Alert variant="error" title="Policy unavailable" description={error} />
      </Card>
    );
  }

  if (empty || !policy) {
    return (
      <Card padded className={clsx(styles.empty, className)}>
        <EmptyState
          icon={<FileText aria-hidden="true" />}
          title="No policy"
          description="No policy document to display."
        />
      </Card>
    );
  }

  const isDisabled = Boolean(disabled?.disabled);
  const statusLabel = policy.status ?? "active";
  const statusVariant = STATUS_VARIANT[statusLabel.toLowerCase()] ?? "neutral";
  const effectiveLabel = formatDate(policy.effectiveDate);
  const reviewedLabel = formatDate(policy.lastReviewedAt);
  const reviewDueLabel = formatDate(policy.nextReviewDate);
  const links = policy.documentLinks ?? [];

  return (
    <Card
      padded={false}
      className={clsx(styles.card, isDisabled && styles.disabled, className)}
      aria-disabled={isDisabled || undefined}
    >
      <div className={styles.body}>
        <div className={styles.header}>
          <span className={styles.icon}>
            <FileText aria-hidden="true" />
          </span>
          <div className={styles.headerInfo}>
            <h3 className={styles.title}>{policy.title}</h3>
            {policy.category && (
              <p className={styles.category}>{policy.category}</p>
            )}
          </div>
          <span className={styles.status}>
            {status ?? (
              <Badge variant={statusVariant} dot size="sm">
                {statusLabel}
              </Badge>
            )}
          </span>
        </div>

        {policy.description && (
          <p className={styles.description}>{policy.description}</p>
        )}

        <div className={styles.meta}>
          {policy.issuer && (
            <div className={styles.metaItem}>
              <span className={styles.metaIcon}>
                <Building2 aria-hidden="true" />
              </span>
              <span className={styles.metaValue}>{policy.issuer}</span>
            </div>
          )}
          {policy.version && (
            <div className={styles.metaItem}>
              <span className={styles.metaIcon}>
                <Tag aria-hidden="true" />
              </span>
              <span className={styles.metaValue}>v{policy.version}</span>
            </div>
          )}
          {effectiveLabel && (
            <div className={styles.metaItem}>
              <span className={styles.metaIcon}>
                <Calendar aria-hidden="true" />
              </span>
              <span className={styles.metaValue}>Effective {effectiveLabel}</span>
            </div>
          )}
          {reviewedLabel && (
            <div className={styles.metaItem}>
              <span className={styles.metaIcon}>
                <ClipboardList aria-hidden="true" />
              </span>
              <span className={styles.metaValue}>Reviewed {reviewedLabel}</span>
            </div>
          )}
          {reviewDueLabel && (
            <div className={styles.metaItem}>
              <span className={styles.metaIcon}>
                <Calendar aria-hidden="true" />
              </span>
              <span className={styles.metaValue}>Review due {reviewDueLabel}</span>
            </div>
          )}
        </div>

        {links.length > 0 && (
          <div className={styles.links}>
            {links.map((link) => {
              const isExternal =
                link.type?.toLowerCase() !== "pdf" &&
                Boolean(link.url?.startsWith("http"));
              return (
                <a
                  key={link.id}
                  href={link.url ?? "#"}
                  className={styles.link}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  download={link.type?.toLowerCase() === "pdf" ? true : undefined}
                >
                  <span className={styles.linkIcon}>
                    {isExternal ? (
                      <ExternalLink aria-hidden="true" />
                    ) : (
                      <Download aria-hidden="true" />
                    )}
                  </span>
                  <span className={styles.linkLabel}>{link.label}</span>
                  {link.type && (
                    <span className={styles.linkType}>{link.type}</span>
                  )}
                </a>
              );
            })}
          </div>
        )}

        {isDisabled && disabled?.disabledReason && (
          <p className={styles.disabledReason}>{disabled.disabledReason}</p>
        )}
      </div>

      {actions && (
        <div className={styles.footer}>
          <div className={styles.actions}>{actions}</div>
        </div>
      )}
    </Card>
  );
}
