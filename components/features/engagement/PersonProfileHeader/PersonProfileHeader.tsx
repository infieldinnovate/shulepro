import type { ReactNode } from "react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Alert } from "@/components/ui/Alert";
import { UserX, Mail, Phone, MapPin } from "lucide-react";
import type { PersonProfile, DisabledState } from "@/components/features/engagement/models";
import styles from "./PersonProfileHeader.module.scss";

export interface PersonProfileHeaderProps {
  /** Person profile data — all fields are configurable via props. */
  profile?: PersonProfile | null;
  /** Optional breadcrumb slot rendered above the header. */
  breadcrumbs?: ReactNode;
  /** Optional status badge slot. */
  status?: ReactNode;
  /** Action buttons slot. */
  actions?: ReactNode;
  /** Loading state — shows a spinner. */
  loading?: boolean;
  /** Error message — shows an error alert. */
  error?: string;
  /** Empty state — shows an empty placeholder. */
  empty?: boolean;
  /** Disabled state — dims the header and shows a reason. */
  disabled?: DisabledState;
  className?: string;
}

export function PersonProfileHeader({
  profile,
  breadcrumbs,
  status,
  actions,
  loading = false,
  error,
  empty = false,
  disabled,
  className,
}: PersonProfileHeaderProps) {
  if (loading) {
    return (
      <Card padded className={clsx(styles.loading, className)}>
        <Spinner size="lg" label="Loading profile" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card padded className={className}>
        <Alert variant="error" title="Profile unavailable" description={error} />
      </Card>
    );
  }

  if (empty || !profile) {
    return (
      <Card padded className={clsx(styles.empty, className)}>
        <EmptyState
          icon={<UserX aria-hidden="true" />}
          title="No person"
          description="No profile to display."
        />
      </Card>
    );
  }

  const contactItems: { icon: ReactNode; value: string; label: string }[] = [];
  if (profile.contact?.phone) {
    contactItems.push({
      icon: <Phone aria-hidden="true" />,
      value: profile.contact.phone,
      label: "Phone",
    });
  }
  if (profile.contact?.email) {
    contactItems.push({
      icon: <Mail aria-hidden="true" />,
      value: profile.contact.email,
      label: "Email",
    });
  }
  const addressParts = [
    profile.contact?.addressLine,
    profile.contact?.postalCode,
    profile.contact?.town,
  ].filter(Boolean);
  if (addressParts.length > 0) {
    contactItems.push({
      icon: <MapPin aria-hidden="true" />,
      value: addressParts.join(", "),
      label: "Address",
    });
  }

  const sortedFields = [...(profile.fields ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );

  const isDisabled = Boolean(disabled?.disabled);

  return (
    <Card
      padded={false}
      className={clsx(
        styles.header,
        isDisabled && styles.disabled,
        className,
      )}
      aria-disabled={isDisabled || undefined}
    >
      {breadcrumbs && <div className={styles.breadcrumbs}>{breadcrumbs}</div>}
      <div className={styles.main}>
        <Avatar
          src={profile.avatarSrc}
          name={profile.name}
          alt={profile.name}
          size="xl"
          className={styles.avatar}
        />
        <div className={styles.info}>
          <div className={styles.nameRow}>
            <h2 className={styles.name}>{profile.name}</h2>
            {status && <span className={styles.status}>{status}</span>}
          </div>
          {profile.roleLabel && (
            <p className={styles.roleLabel}>{profile.roleLabel}</p>
          )}
          {isDisabled && disabled?.disabledReason && (
            <p className={styles.disabledReason}>{disabled.disabledReason}</p>
          )}
          {contactItems.length > 0 && (
            <ul className={styles.contactList}>
              {contactItems.map((item) => (
                <li key={item.label} className={styles.contactItem}>
                  <span className={styles.contactIcon}>{item.icon}</span>
                  <span className={styles.contactText}>{item.value}</span>
                </li>
              ))}
            </ul>
          )}
          {sortedFields.length > 0 && (
            <dl className={styles.fields}>
              {sortedFields.map((field) => (
                <div key={field.key} className={styles.field}>
                  <dt className={styles.fieldLabel}>{field.label}</dt>
                  <dd className={styles.fieldValue}>
                    {field.sensitive ? "••••••" : (field.value ?? "—")}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </Card>
  );
}
