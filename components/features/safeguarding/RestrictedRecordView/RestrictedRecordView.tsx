import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import clsx from "clsx";
import { Card } from "../../../ui/Card";
import { EmptyState } from "../../../ui/EmptyState";
import styles from "./RestrictedRecordView.module.scss";

export interface RestrictedRecordViewProps {
  /** When false, renders a restricted notice instead of children. */
  hasAccess: boolean;
  /** Optional message for the restricted notice. */
  restrictedMessage?: string;
  /** Optional title for the restricted notice. */
  restrictedTitle?: string;
  children?: ReactNode;
  className?: string;
}

export function RestrictedRecordView({
  hasAccess,
  restrictedMessage = "You do not have permission to view this record. Access is restricted to authorized personnel.",
  restrictedTitle = "Access restricted",
  children,
  className,
}: RestrictedRecordViewProps) {
  if (!hasAccess) {
    return (
      <Card className={clsx(styles.restrictedCard, className)} padded>
        <EmptyState
          icon={<Lock aria-hidden="true" />}
          title={restrictedTitle}
          description={restrictedMessage}
        />
      </Card>
    );
  }

  return <>{children}</>;
}
