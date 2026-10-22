// ============================================================
// Operations domain types
// All statuses, conditions, categories, and maintenance types
// are configurable string unions — no hardcoded enums. Items,
// assets, and vehicles are kept fully caller-configurable.
// ============================================================

/** Configurable inventory item condition (caller-defined union). */
export type InventoryItemCondition = string;

/** Configurable inventory item status (caller-defined union). */
export type InventoryItemStatus = string;

/** Configurable inventory category (caller-defined union). */
export type InventoryItemCategory = string;

/** Configurable asset assignment status (caller-defined union). */
export type AssetAssignmentStatus = string;

/** Configurable maintenance type (caller-defined union). */
export type MaintenanceType = string;

/** Configurable maintenance record status (caller-defined union). */
export type MaintenanceRecordStatus = string;

/** A reference to a person or department by id. */
export type AssigneeRef = string;

/** A reference to an asset or vehicle by id. */
export type AssetRef = string;

/** An inventory item record. */
export interface InventoryItem {
  id: string;
  name: string;
  code: string;
  category: InventoryItemCategory;
  quantity: number;
  unit: string;
  condition: InventoryItemCondition;
  status: InventoryItemStatus;
  location?: string;
  lastUpdated?: Date | string;
}

/** An asset assignment record. */
export interface AssetAssignment {
  id: string;
  assetRef: AssetRef;
  assetLabel?: string;
  assigneeRef: AssigneeRef;
  assigneeName: string;
  assignmentDate: Date | string;
  expectedReturnDate?: Date | string;
  notes?: string;
  status?: AssetAssignmentStatus;
}

/** A maintenance record for an asset or vehicle. */
export interface MaintenanceRecord {
  id: string;
  assetRef: AssetRef;
  assetLabel?: string;
  maintenanceType: MaintenanceType;
  date: Date | string;
  cost?: number;
  currency?: string;
  provider?: string;
  description: string;
  nextDueDate?: Date | string;
  status?: MaintenanceRecordStatus;
}
