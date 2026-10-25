import { StatusBadge } from "@/components/shared/StatusBadge";
import type { StatusBadgeMap } from "@/components/shared/StatusBadge";
import type { BadgeSize } from "@/components/ui/Badge";
import type { VehicleStatus } from "@/components/features/transport/types";

export type VehicleStatusBadgeMap = StatusBadgeMap<VehicleStatus>;

export interface VehicleStatusBadgeProps {
  status: VehicleStatus;
  statusMap: VehicleStatusBadgeMap;
  size?: BadgeSize;
  className?: string;
}

export function VehicleStatusBadge({
  status,
  statusMap,
  size = "sm",
  className,
}: VehicleStatusBadgeProps) {
  return (
    <StatusBadge
      status={status}
      statusMap={statusMap}
      size={size}
      className={className}
    />
  );
}
