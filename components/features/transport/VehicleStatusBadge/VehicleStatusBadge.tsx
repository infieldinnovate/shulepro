import { StatusBadge } from "../../../shared/StatusBadge";
import type { StatusBadgeMap } from "../../../shared/StatusBadge";
import type { BadgeSize } from "../../../ui/Badge";
import type { VehicleStatus } from "../types";

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
