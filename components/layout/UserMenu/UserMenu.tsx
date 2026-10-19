"use client";

import type { ReactNode } from "react";
import { ChevronDown, LogOut, Settings, User as UserIcon } from "lucide-react";
import { DropdownMenu } from "../../ui/DropdownMenu";
import { Avatar } from "../../ui/Avatar";
import clsx from "clsx";
import type {
  DropdownMenuActionItem,
  DropdownMenuItem,
} from "../../ui/DropdownMenu";
import type { UserDisplayModel } from "../headerTypes";
import styles from "./UserMenu.module.scss";

export interface UserMenuProps {
  user: UserDisplayModel;
  onProfile?: () => void;
  onSettings?: () => void;
  onSignOut?: () => void;
  /** Extra action items rendered between settings and sign-out. */
  extraItems?: Array<{
    id?: string;
    label: ReactNode;
    icon?: ReactNode;
    onSelect?: () => void;
    disabled?: boolean;
  }>;
  profileLabel?: string;
  settingsLabel?: string;
  signOutLabel?: string;
  ariaLabel?: string;
  /** Hide the text label on narrow screens (avatar-only trigger). */
  compactBelowMd?: boolean;
  className?: string;
}

export function UserMenu({
  user,
  onProfile,
  onSettings,
  onSignOut,
  extraItems = [],
  profileLabel = "Profile",
  settingsLabel = "Settings",
  signOutLabel = "Sign out",
  ariaLabel = "User menu",
  compactBelowMd = true,
  className,
}: UserMenuProps) {
  const showLabel = !compactBelowMd;
  const trigger = (
    <span className={styles.trigger}>
      <Avatar
        src={user.avatarSrc}
        name={user.initials ?? user.name}
        alt={user.name}
        size="sm"
        className={styles.avatar}
      />
      <span
        className={clsx(
          styles.triggerLabel,
          compactBelowMd && styles.compactBelowMd,
        )}
      >
        {showLabel && <span className={styles.name}>{user.name}</span>}
        {showLabel && user.roleLabel && (
          <span className={styles.role}>{user.roleLabel}</span>
        )}
      </span>
      <ChevronDown
        className={clsx(styles.chevron, compactBelowMd && styles.compactBelowMd)}
        aria-hidden="true"
      />
    </span>
  );

  const items: DropdownMenuItem[] = [
    {
      type: "label",
      label: (
        <span className={styles.menuLabel}>
          <span className={styles.menuName}>{user.name}</span>
          {user.email && (
            <span className={styles.menuEmail}>{user.email}</span>
          )}
        </span>
      ),
    },
    { type: "divider" },
    {
      type: "item",
      id: "profile",
      label: profileLabel,
      icon: <UserIcon aria-hidden="true" />,
      onSelect: onProfile,
    },
    {
      type: "item",
      id: "settings",
      label: settingsLabel,
      icon: <Settings aria-hidden="true" />,
      onSelect: onSettings,
    },
    ...(extraItems.map(
      (item): DropdownMenuActionItem => ({
        type: "item",
        id: item.id,
        label: item.label,
        icon: item.icon,
        onSelect: item.onSelect,
        disabled: item.disabled,
      }),
    )),
    { type: "divider" },
    {
      type: "item",
      id: "signout",
      label: signOutLabel,
      icon: <LogOut aria-hidden="true" />,
      onSelect: onSignOut,
    },
  ];

  return (
    <div className={styles.container}>
      <DropdownMenu
        items={items}
        trigger={trigger}
        align="end"
        ariaLabel={ariaLabel}
        className={className}
      />
    </div>
  );
}

export type { UserDisplayModel } from "../headerTypes";

export type UserMenuComponentProps = UserMenuProps & {
  children?: ReactNode;
};
