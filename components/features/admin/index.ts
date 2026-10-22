// ============================================================
// Admin feature — barrel exports
// ============================================================

export type {
  UserRole,
  UserAccountStatus,
  PermissionType,
  PermissionValue,
  UserAccount,
  UserAccountFormData,
  RoleDefinition,
  ResourceDefinition,
  PermissionDefinition,
  PermissionCell,
  PermissionChange,
} from "./types";

export { UserAccountForm } from "./UserAccountForm";
export type {
  UserAccountFormProps,
  UserAccountFormOptions,
} from "./UserAccountForm";

export { RolePermissionMatrix } from "./RolePermissionMatrix";
export type { RolePermissionMatrixProps } from "./RolePermissionMatrix";
