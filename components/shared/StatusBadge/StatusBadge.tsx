import type { ReactNode } from "react";
import { Badge } from "../../ui/Badge";
import type { BadgeVariant, BadgeSize } from "../../ui/Badge";

export interface StatusBadgeMapping {
  variant: BadgeVariant;
  label: string;
  icon?: ReactNode;
  /** Render a leading status dot instead of (or alongside) the icon. */
  dot?: boolean;
}

export type StatusBadgeMap<Status extends string | number> = Record<
  Status,
  StatusBadgeMapping
>;

export interface StatusBadgeProps<Status extends string | number> {
  status: Status;
  statusMap: StatusBadgeMap<Status>;
  size?: BadgeSize;
  className?: string;
}

export function StatusBadge<Status extends string | number>({
  status,
  statusMap,
  size = "md",
  className,
}: StatusBadgeProps<Status>) {
  const mapping = statusMap[status];
  if (!mapping) return null;

  return (
    <Badge
      variant={mapping.variant}
      size={size}
      dot={mapping.dot}
      icon={mapping.icon}
      className={className}
    >
      {mapping.label}
    </Badge>
  );
}
