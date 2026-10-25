import type { ReactNode } from "react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Award, Calendar, FileText, Hash, User } from "lucide-react";
import type { Certificate, DisabledState } from "@/components/features/engagement/models";
import { EmptyState } from "@/components/ui/EmptyState";
import styles from "./CertificateCard.module.scss";

export interface CertificateCardProps {
  /** Certificate data — supplied entirely via props. */
  certificate?: Certificate | null;
  /** Optional issuer label (overrides courseLabel for issuer display). */
  issuer?: string;
  /** Loading state. */
  loading?: boolean;
  /** Disabled state. */
  disabled?: DisabledState;
  /** Optional action slot (e.g. download button). */
  actions?: ReactNode;
  className?: string;
}

function formatDateLabel(value?: Date | string): string | null {
  if (!value) return null;
  const date = typeof value === "string" ? new Date(value) : value;
  if (date instanceof Date && !Number.isNaN(date.getTime())) {
    return date.toLocaleDateString();
  }
  if (typeof value === "string") return value;
  return null;
}

export function CertificateCard({
  certificate,
  issuer,
  loading = false,
  disabled,
  actions,
  className,
}: CertificateCardProps) {
  if (loading) {
    return (
      <Card padded className={clsx(styles.loading, className)}>
        <Spinner size="md" label="Loading certificate" />
      </Card>
    );
  }

  if (!certificate) {
    return (
      <Card padded className={clsx(styles.empty, className)}>
        <EmptyState
          icon={<Award aria-hidden="true" />}
          title="No certificate"
          description="No certificate to display."
        />
      </Card>
    );
  }

  const isDisabled = Boolean(disabled?.disabled);
  const issuedLabel = formatDateLabel(certificate.validity.issuedAt);
  const expiresLabel = formatDateLabel(certificate.validity.expiresAt);
  const validityStatus = certificate.validity.currentlyValid;
  const issuerLabel = issuer ?? certificate.courseLabel;

  return (
    <Card
      padded={false}
      className={clsx(styles.card, isDisabled && styles.disabled, className)}
      aria-disabled={isDisabled || undefined}
    >
      <div className={styles.body}>
        <div className={styles.header}>
          <span className={styles.icon}>
            <Award aria-hidden="true" />
          </span>
          <div className={styles.headerInfo}>
            <h3 className={styles.title}>Certificate</h3>
            {certificate.courseLabel && (
              <p className={styles.course}>{certificate.courseLabel}</p>
            )}
          </div>
          {validityStatus !== undefined && (
            <Badge
              variant={validityStatus ? "success" : "warning"}
              dot
              size="sm"
            >
              {certificate.validity.statusLabel ??
                (validityStatus ? "Valid" : "Expired")}
            </Badge>
          )}
        </div>

        {certificate.staffName && (
          <div className={styles.detailRow}>
            <span className={styles.detailIcon}>
              <User aria-hidden="true" />
            </span>
            <span className={styles.detailLabel}>Awarded to</span>
            <span className={styles.detailValue}>{certificate.staffName}</span>
          </div>
        )}

        {issuerLabel && (
          <div className={styles.detailRow}>
            <span className={styles.detailIcon}>
              <FileText aria-hidden="true" />
            </span>
            <span className={styles.detailLabel}>Course</span>
            <span className={styles.detailValue}>{issuerLabel}</span>
          </div>
        )}

        {issuedLabel && (
          <div className={styles.detailRow}>
            <span className={styles.detailIcon}>
              <Calendar aria-hidden="true" />
            </span>
            <span className={styles.detailLabel}>Issued</span>
            <span className={styles.detailValue}>{issuedLabel}</span>
          </div>
        )}

        {expiresLabel && (
          <div className={styles.detailRow}>
            <span className={styles.detailIcon}>
              <Calendar aria-hidden="true" />
            </span>
            <span className={styles.detailLabel}>Expires</span>
            <span className={styles.detailValue}>{expiresLabel}</span>
          </div>
        )}

        {certificate.certificateNumber && (
          <div className={styles.detailRow}>
            <span className={styles.detailIcon}>
              <Hash aria-hidden="true" />
            </span>
            <span className={styles.detailLabel}>ID</span>
            <span className={styles.detailValue}>
              {certificate.certificateNumber}
            </span>
          </div>
        )}

        {isDisabled && disabled?.disabledReason && (
          <p className={styles.disabledReason}>{disabled.disabledReason}</p>
        )}
      </div>

      {(actions || certificate.documentUrl) && (
        <div className={styles.footer}>
          {certificate.documentUrl && !actions && (
            <a
              href={certificate.documentUrl}
              className={styles.documentLink}
              download
            >
              <FileText aria-hidden="true" />
              <span>Download</span>
            </a>
          )}
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      )}
    </Card>
  );
}
