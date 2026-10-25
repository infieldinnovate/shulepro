import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { StatusBadgeMap } from "@/components/shared/StatusBadge";
import type {
  SafeguardingCase,
  SafeguardingCaseStatus,
  RiskLevel,
} from "@/components/features/safeguarding/types";
import { formatDateMedium } from "@/lib/formatTime";
import styles from "./SafeguardingCaseHeader.module.scss";

export type CaseStatusBadgeMap = StatusBadgeMap<SafeguardingCaseStatus>;
export type RiskLevelBadgeMap = StatusBadgeMap<RiskLevel>;

export interface SafeguardingCaseHeaderProps {
  case: SafeguardingCase | null;
  caseStatusMap: CaseStatusBadgeMap;
  riskLevelMap: RiskLevelBadgeMap;
  /** Display name for the learner (caller-provided). */
  learnerName?: string;
  /** Avatar source for the learner. */
  learnerAvatarSrc?: string;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  /** Optional action buttons rendered in the header. */
  actions?: ReactNode;
  className?: string;
}

export function SafeguardingCaseHeader({
  case: caseRecord,
  caseStatusMap,
  riskLevelMap,
  learnerName,
  learnerAvatarSrc,
  loading = false,
  error,
  empty = false,
  actions,
  className,
}: SafeguardingCaseHeaderProps) {
  if (loading) {
    return (
      <Card className={clsx(styles.loadingCard, className)} padded>
        <div className={styles.loadingBody}>
          <Spinner size="md" label="Loading case header" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <Alert
          variant="error"
          title="Unable to load case"
          description={error}
        />
      </Card>
    );
  }

  if (empty || !caseRecord) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <EmptyState
          icon={<ShieldCheck aria-hidden="true" />}
          title="No case"
          description="There is no safeguarding case to display."
        />
      </Card>
    );
  }

  return (
    <Card className={clsx(styles.card, className)} padded>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <div className={styles.titleGroup}>
            <ShieldCheck aria-hidden="true" className={styles.titleIcon} />
            <div>
              <h3 className={styles.caseRef}>{caseRecord.caseRef}</h3>
              {learnerName && (
                <p className={styles.learnerName}>{learnerName}</p>
              )}
            </div>
          </div>
          <div className={styles.badgeRow}>
            <StatusBadge
              status={caseRecord.status}
              statusMap={caseStatusMap}
              size="sm"
            />
            <StatusBadge
              status={caseRecord.riskLevel}
              statusMap={riskLevelMap}
              size="sm"
            />
          </div>
        </div>
      </div>

      <dl className={styles.metaGrid}>
        {caseRecord.assignedToName && (
          <div className={styles.metaItem}>
            <dt className={styles.metaLabel}>Assigned to</dt>
            <dd className={styles.metaValue}>
              <Avatar
                name={caseRecord.assignedToName}
                src={learnerAvatarSrc}
                alt=""
                size="sm"
              />
              {caseRecord.assignedToName}
            </dd>
          </div>
        )}
        <div className={styles.metaItem}>
          <dt className={styles.metaLabel}>Opened</dt>
          <dd className={styles.metaValue}>
            {formatDateMedium(caseRecord.openedAt)}
          </dd>
        </div>
      </dl>

      {caseRecord.summary && (
        <p className={styles.summary}>{caseRecord.summary}</p>
      )}

      {actions && <div className={styles.actions}>{actions}</div>}
    </Card>
  );
}
