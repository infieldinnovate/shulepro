// ============================================================
// Administration domain types
// All roles, statuses, and permission types are configurable
// string unions — no hardcoded enums. The permission matrix
// is purely presentational; the caller owns all access control.
// ============================================================

/** Configurable user account role (caller-defined union). */
export type UserRole = string;

/** Configurable user account status (caller-defined union). */
export type UserAccountStatus = string;

/** Configurable permission type for the permission matrix. */
export type PermissionType = string;

/** Configurable permission value for a role/resource cell. */
export type PermissionValue = boolean | "allowed" | "denied" | "inherit";

/** A user account record. */
export interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserAccountStatus;
  phone?: string;
  department?: string;
}

/** User account form data (create or edit). */
export interface UserAccountFormData {
  fullName: string;
  email: string;
  role: string;
  status: string;
  phone: string;
  department: string;
}

/** A role definition for the permission matrix. */
export interface RoleDefinition {
  id: string;
  label: string;
}

/** A resource definition for the permission matrix. */
export interface ResourceDefinition {
  id: string;
  label: string;
}

/** A permission type definition (e.g. view, create, edit, delete). */
export interface PermissionDefinition {
  id: PermissionType;
  label: string;
}

/** A single cell in the permission matrix. */
export interface PermissionCell {
  roleId: string;
  resourceId: string;
  permissionId: PermissionType;
  value: PermissionValue;
}

/** A proposed permission change emitted to the parent. */
export interface PermissionChange {
  roleId: string;
  resourceId: string;
  permissionId: PermissionType;
  previousValue: PermissionValue;
  nextValue: PermissionValue;
}
