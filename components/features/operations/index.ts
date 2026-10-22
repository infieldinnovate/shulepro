// ============================================================
// Operations feature — barrel exports
// ============================================================

export type {
  InventoryItemCondition,
  InventoryItemStatus,
  InventoryItemCategory,
  AssetAssignmentStatus,
  MaintenanceType,
  MaintenanceRecordStatus,
  AssigneeRef,
  AssetRef,
  InventoryItem,
  AssetAssignment,
  MaintenanceRecord,
  MealType,
  MealProgrammeStatus,
  MealProgramme,
  LibraryItemCategory,
  LibraryAvailabilityStatus,
  LibraryItem,
  LibraryBorrower,
  LibraryIssueRecord,
  HealthVisitType,
  HealthRecordStatus,
  HealthRecord,
} from "./types";

export { InventoryItemCard } from "./InventoryItemCard";
export type {
  InventoryItemCardProps,
  ConditionBadgeMap,
  ItemStatusBadgeMap,
} from "./InventoryItemCard";

export { AssetAssignmentForm } from "./AssetAssignmentForm";
export type {
  AssetAssignmentFormProps,
  AssetAssignmentFormData,
  AssetAssignmentFormOptions,
} from "./AssetAssignmentForm";

export { MaintenanceRecordForm } from "./MaintenanceRecordForm";
export type {
  MaintenanceRecordFormProps,
  MaintenanceRecordFormData,
  MaintenanceRecordFormOptions,
} from "./MaintenanceRecordForm";

export { MealProgrammeCard } from "./MealProgrammeCard";
export type {
  MealProgrammeCardProps,
  MealProgrammeStatusBadgeMap,
} from "./MealProgrammeCard";

export { LibraryItemCard } from "./LibraryItemCard";
export type {
  LibraryItemCardProps,
  LibraryAvailabilityBadgeMap,
} from "./LibraryItemCard";

export { IssueReturnPanel } from "./IssueReturnPanel";
export type { IssueReturnPanelProps } from "./IssueReturnPanel";

export { HealthRecordPanel } from "./HealthRecordPanel";
export type { HealthRecordPanelProps } from "./HealthRecordPanel";
