// ============================================================
// Transport domain types
// All statuses, route statuses, and vehicle statuses are
// configurable string unions — no hardcoded enums.
// ============================================================

/** Configurable transport route status (caller-defined union). */
export type TransportRouteStatus = string;

/** Configurable vehicle operational status (caller-defined union). */
export type VehicleStatus = string;

/** Configurable transport attendance mark (caller-defined union). */
export type TransportAttendanceMark = string;

/** A reference to a vehicle by id. */
export type VehicleRef = string;

/** A reference to a driver by id. */
export type DriverRef = string;

/** A reference to a transport route by id. */
export type TransportRouteRef = string;

/** A vehicle record. */
export interface Vehicle {
  id: string;
  label: string;
  plateNumber?: string;
  capacity?: number;
  status?: VehicleStatus;
}

/** A driver record. */
export interface Driver {
  id: string;
  name: string;
  phone?: string;
}

/** A transport route record. */
export interface TransportRoute {
  id: string;
  name: string;
  code: string;
  stops?: string[];
  vehicleId?: VehicleRef;
  vehicleLabel?: string;
  driverId?: DriverRef;
  driverName?: string;
  capacity?: number;
  departureTime?: string;
  status?: TransportRouteStatus;
}

/** A passenger (learner or other person) eligible for transport. */
export interface TransportPassenger {
  id: string;
  name: string;
  gradeOrRole?: string;
  avatarSrc?: string;
  initials?: string;
}

/** Current allocation of a passenger to a route. */
export interface TransportAllocation {
  passengerId: string;
  routeId: string;
}

/** A single passenger's attendance mark for a route on a date. */
export interface TransportAttendanceEntry {
  passengerId: string;
  mark: TransportAttendanceMark;
  note?: string;
}
