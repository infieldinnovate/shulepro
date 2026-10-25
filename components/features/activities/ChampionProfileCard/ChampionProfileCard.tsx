import type { ReactNode } from "react";
import { Award, Link2 } from "lucide-react";
import clsx from "clsx";
import { RecordSummaryCard } from "@/components/shared/RecordSummaryCard";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import type { ChampionProfile } from "@/components/features/activities/types";
import styles from "./ChampionProfileCard.module.scss";

export interface ChampionProfileCardProps {
  /** Configurable champion/role-model profile. */
  profile: ChampionProfile | null;
  loading?: boolean;
  error?: string;
  /** Optional click handler. */
  onSelect?: () => void;
  /** Optional content rendered below the profile. */
  children?: ReactNode;
  className?: string;
}

export function ChampionProfileCard({
  profile,
  loading = false,
  error,
  onSelect,
  children,
  className,
}: ChampionProfileCardProps) {
  if (loading) {
    return (
      <div className={clsx(styles.wrapper, className)}>
        <div className={styles.loadingState}>
          <Spinner size="md" label="Loading champion profile" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={clsx(styles.wrapper, className)}>
        <Alert
          variant="error"
          title="Unable to load champion profile"
          description={error}
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={clsx(styles.wrapper, className)}>
        <EmptyState
          icon={<Award aria-hidden="true" />}
          title="No champion profile"
          description="Champion and role-model profiles will appear here once configured."
        />
      </div>
    );
  }

  const meta: ReactNode[] = [];

  if (profile.area) {
    meta.push(
      <div className={styles.metaItem} key="area">
        <dt className={styles.metaLabel}>Area</dt>
        <dd className={styles.metaValue}>{profile.area}</dd>
      </div>,
    );
  }

  if (profile.affiliation) {
    meta.push(
      <div className={styles.metaItem} key="affiliation">
        <dt className={styles.metaLabel}>Affiliation</dt>
        <dd className={styles.metaValue}>{profile.affiliation}</dd>
      </div>,
    );
  }

  if (profile.role) {
    meta.push(
      <div className={styles.metaItem} key="role">
        <dt className={styles.metaLabel}>Role</dt>
        <dd className={styles.metaValue}>{profile.role}</dd>
      </div>,
    );
  }

  const programmeBadges =
    profile.programmes && profile.programmes.length > 0 ? (
      <div className={styles.programmes}>
        <div className={styles.programmesHeader}>
          <Link2 aria-hidden="true" className={styles.programmesIcon} />
          <span className={styles.programmesLabel}>Linked programmes</span>
        </div>
        <div className={styles.programmeBadges}>
          {profile.programmes.map((label, idx) => (
            <Badge key={idx} variant="neutral" size="sm">
              {label}
            </Badge>
          ))}
        </div>
      </div>
    ) : null;

  return (
    <div className={clsx(styles.wrapper, className)}>
      <RecordSummaryCard
        title={profile.name}
        subtitle={profile.bio}
        avatar={
          <Avatar
            src={profile.avatarSrc}
            name={profile.name}
            size="lg"
          />
        }
        meta={meta}
        onClick={onSelect}
        ariaLabel={onSelect ? `View ${profile.name}` : undefined}
      />
      {programmeBadges}
      {children}
    </div>
  );
}
