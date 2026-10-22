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
  SchoolSettingsFormData,
  AcademicPeriodType,
  AcademicPeriodStatus,
  AcademicPeriod,
  AcademicPeriodFormData,
  AssessmentTypeEntry,
  DescriptorEntry,
  ScaleLevelEntry,
  AssessmentConfigurationFormData,
  AuditLogActionType,
  AuditLogSeverity,
  AuditLogEvent,
  AuditLogSortState,
  AuditLogPaginationState,
} from "./types";

export { UserAccountForm } from "./UserAccountForm";
export type {
  UserAccountFormProps,
  UserAccountFormOptions,
} from "./UserAccountForm";

export { RolePermissionMatrix } from "./RolePermissionMatrix";
export type { RolePermissionMatrixProps } from "./RolePermissionMatrix";

export { SchoolSettingsForm } from "./SchoolSettingsForm";
export type {
  SchoolSettingsFormProps,
  SchoolSettingsFormOptions,
} from "./SchoolSettingsForm";

export { AcademicYearSettings } from "./AcademicYearSettings";
export type {
  AcademicYearSettingsProps,
  AcademicYearSettingsOptions,
} from "./AcademicYearSettings";

export { AssessmentConfigurationForm } from "./AssessmentConfigurationForm";
export type { AssessmentConfigurationFormProps } from "./AssessmentConfigurationForm";

export { AuditLogTable, AUDIT_LOG_COLUMN_IDS, DEFAULT_COLUMN_VISIBILITY } from "./AuditLogTable";
export type { AuditLogTableProps, AuditLogColumnId } from "./AuditLogTable";
