import type { ReactNode } from "react";
import { Phone, Mail, Users, Star, UserPlus } from "lucide-react";
import clsx from "clsx";
import { Avatar } from "@/components/ui/Avatar";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Guardian } from "@/components/features/learners/types";
import styles from "./GuardianList.module.scss";

export interface GuardianListProps {
  guardians?: Guardian[] | null;
  /** Rendered when data is still loading. */
  loading?: boolean;
  /** Error message rendered in an Alert. */
  error?: string;
  /** Called when a guardian row is clicked (row becomes interactive). */
  onSelectGuardian?: (guardian: Guardian) => void;
  /** Slot rendered as an "add guardian" action (e.g. a Button). */
  onAddGuardian?: ReactNode;
  /** Accessible label for the list. */
  ariaLabel?: string;
  className?: string;
}

export function GuardianList({
  guardians,
  loading = false,
  error,
  onSelectGuardian,
  onAddGuardian,
  ariaLabel = "Guardians",
  className,
}: GuardianListProps) {
  if (loading) {
    return (
      <div className={clsx(styles.loading, className)}>
        <Spinner size="md" label="Loading guardians" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        variant="error"
        title="Unable to load guardians"
        description={error}
        className={className}
      />
    );
  }

  const list = guardians ?? [];
  const isEmpty = list.length === 0;

  if (isEmpty) {
    return (
      <EmptyState
        icon={<Users aria-hidden="true" />}
        title="No guardians recorded"
        description="No guardian information is available for this learner."
        primaryAction={onAddGuardian}
        className={className}
      />
    );
  }

  return (
    <ul className={clsx(styles.list, className)} aria-label={ariaLabel}>
      {list.map((guardian) => {
        const interactive = Boolean(onSelectGuardian);
        const phone = guardian.contact?.phone;
        const email = guardian.contact?.email;

        const row = (
          <>
            <Avatar
              src={guardian.avatarSrc}
              name={guardian.name}
              alt={`Avatar for ${guardian.name}`}
              size="md"
            />
            <div className={styles.info}>
              <div className={styles.nameRow}>
                <span className={styles.name}>{guardian.name}</span>
                {guardian.primary && (
                  <span className={styles.primaryBadge} title="Primary guardian">
                    <Star aria-hidden="true" className={styles.primaryIcon} />
                    <span className={styles.primaryLabel}>Primary</span>
                  </span>
                )}
              </div>
              {guardian.relationship && (
                <span className={styles.relationship}>{guardian.relationship}</span>
              )}
              {(phone || email) && (
                <div className={styles.contactRow}>
                  {phone && (
                    <span className={styles.contactItem}>
                      <Phone aria-hidden="true" className={styles.contactIcon} />
                      <span>{phone}</span>
                    </span>
                  )}
                  {email && (
                    <span className={styles.contactItem}>
                      <Mail aria-hidden="true" className={styles.contactIcon} />
                      <span>{email}</span>
                    </span>
                  )}
                </div>
              )}
            </div>
            {interactive && <span className={styles.chevron} aria-hidden="true" />}
          </>
        );

        if (interactive) {
          return (
            <li key={guardian.id} className={styles.itemInteractive}>
              <button
                type="button"
                className={styles.rowButton}
                onClick={() => onSelectGuardian?.(guardian)}
                aria-label={`View ${guardian.name}`}
              >
                {row}
              </button>
            </li>
          );
        }

        return (
          <li key={guardian.id} className={styles.item}>
            <div className={styles.rowStatic}>{row}</div>
          </li>
        );
      })}
      {onAddGuardian && (
        <li className={styles.addAction}>
          <span className={styles.addActionIcon}>
            <UserPlus aria-hidden="true" />
          </span>
          {onAddGuardian}
        </li>
      )}
    </ul>
  );
}
