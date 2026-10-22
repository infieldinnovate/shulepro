// ============================================================
// Transport feature — barrel exports
// ============================================================

export type {
  TransportRouteStatus,
  VehicleStatus,
  TransportAttendanceMark,
  VehicleRef,
  DriverRef,
  TransportRouteRef,
  Vehicle,
  Driver,
  TransportRoute,
  TransportPassenger,
  TransportAllocation,
  TransportAttendanceEntry,
} from "./types";

export { VehicleStatusBadge } from "./VehicleStatusBadge";
export type { VehicleStatusBadgeProps, VehicleStatusBadgeMap } from "./VehicleStatusBadge";

export { TransportRouteCard } from "./TransportRouteCard";
export type { TransportRouteCardProps, RouteStatusBadgeMap } from "./TransportRouteCard";

export { TransportAllocationPanel } from "./TransportAllocationPanel";
export type { TransportAllocationPanelProps } from "./TransportAllocationPanel";

export { TransportAttendanceRegister } from "./TransportAttendanceRegister";
export type { TransportAttendanceRegisterProps } from "./TransportAttendanceRegister";
