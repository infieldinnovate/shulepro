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
