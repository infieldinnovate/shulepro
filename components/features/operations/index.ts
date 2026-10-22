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
