import { Avatar } from "@/components/ui/Avatar";
import type { AvatarSize } from "@/components/ui/Avatar";
import clsx from "clsx";
import type { Learner, EnrolmentStatus } from "@/components/features/learners/types";
import styles from "./LearnerAvatar.module.scss";

export type LearnerAvatarStatus = "active" | "inactive" | "transferred" | "graduated";

export interface LearnerAvatarProps {
  /** Full learner object — name, avatarSrc, and enrolment status are derived from it. */
  learner?: Learner;
  /** Or pass individual fields directly. */
  name?: string;
  avatarSrc?: string;
  initials?: string;
  /** Size override; defaults to "md". */
  size?: AvatarSize;
  /** Explicit enrolment status to derive the status dot from. Overrides learner.enrolment.status. */
  status?: EnrolmentStatus;
  /** Map of enrolment status → avatar dot status. */
  statusMap?: Record<EnrolmentStatus, LearnerAvatarStatus>;
  className?: string;
}

const DEFAULT_STATUS_MAP: Record<string, LearnerAvatarStatus> = {
  active: "active",
  inactive: "inactive",
  transferred: "transferred",
  graduated: "graduated",
  withdrawn: "inactive",
  suspended: "inactive",
};

const DOT_STATUS: Record<LearnerAvatarStatus, "online" | "offline" | "busy" | "away"> = {
  active: "online",
  inactive: "offline",
  transferred: "away",
  graduated: "away",
};

export function LearnerAvatar({
  learner,
  name,
  avatarSrc,
  initials,
  size = "md",
  status,
  statusMap,
  className,
}: LearnerAvatarProps) {
  const resolvedName = name ?? learner?.name;
  const resolvedAvatarSrc = avatarSrc ?? learner?.avatarSrc;
  const resolvedInitials = initials ?? learner?.initials;
  const enrolmentStatus = status ?? learner?.enrolment?.status;
  const map = statusMap ?? DEFAULT_STATUS_MAP;
  const dotStatus = enrolmentStatus ? DOT_STATUS[map[enrolmentStatus] ?? "inactive"] : undefined;

  return (
    <span className={clsx(styles.wrapper, className)}>
      <Avatar
        src={resolvedAvatarSrc}
        name={resolvedInitials ?? resolvedName}
        alt={resolvedName ? `Avatar for ${resolvedName}` : "Learner avatar"}
        size={size}
        status={dotStatus}
      />
    </span>
  );
}
