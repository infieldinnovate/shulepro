import type { ReactNode } from "react";
import { Badge } from "../../ui/Badge";
import type { BadgeVariant, BadgeSize } from "../../ui/Badge";

export interface PriorityBadgeMapping {
  variant: BadgeVariant;
  label: string;
  icon?: ReactNode;
  dot?: boolean;
}

export type PriorityBadgeMap<Priority extends string | number> = Record<
  Priority,
  PriorityBadgeMapping
>;

export interface PriorityBadgeProps<Priority extends string | number> {
  priority: Priority;
  priorityMap: PriorityBadgeMap<Priority>;
  size?: BadgeSize;
  className?: string;
}

export function PriorityBadge<Priority extends string | number>({
  priority,
  priorityMap,
  size = "md",
  className,
}: PriorityBadgeProps<Priority>) {
  const mapping = priorityMap[priority];
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
