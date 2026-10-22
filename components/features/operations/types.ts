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

// ============================================================
// Meal programme types
// ============================================================

/** Configurable meal type (caller-defined union). */
export type MealType = string;

/** Configurable meal programme status (caller-defined union). */
export type MealProgrammeStatus = string;

/** A meal programme entry. */
export interface MealProgramme {
  id: string;
  name: string;
  mealType: MealType;
  date: Date | string;
  servedCount: number;
  eligibleCount: number;
  provider?: string;
  status?: MealProgrammeStatus;
}

// ============================================================
// Library types
// ============================================================

/** Configurable library item category (caller-defined union). */
export type LibraryItemCategory = string;

/** Configurable library availability status (caller-defined union). */
export type LibraryAvailabilityStatus = string;

/** A library item record. */
export interface LibraryItem {
  id: string;
  title: string;
  author?: string;
  isbn?: string;
  category: LibraryItemCategory;
  availableCopies: number;
  totalCopies: number;
  shelfLocation?: string;
  status?: LibraryAvailabilityStatus;
}

/** A borrower reference for library issue/return. */
export interface LibraryBorrower {
  id: string;
  name: string;
}

/** An issue/return record for a library item. */
export interface LibraryIssueRecord {
  itemId: string;
  borrowerId: string;
  borrowerName: string;
  issueDate: Date | string;
  dueDate: Date | string;
  returnDate?: Date | string;
  isIssued: boolean;
}

// ============================================================
// Health record types
// ============================================================

/** Configurable health visit type (caller-defined union). */
export type HealthVisitType = string;

/** Configurable health record status (caller-defined union). */
export type HealthRecordStatus = string;

/** A health record entry. */
export interface HealthRecord {
  id: string;
  learnerName?: string;
  visitDate: Date | string;
  visitType: HealthVisitType;
  provider?: string;
  notes?: string;
  followUpDate?: Date | string;
  status?: HealthRecordStatus;
}

// ============================================================
// Document folder tree types
// ============================================================

/** A hierarchical folder node in a document folder tree. */
export interface DocumentFolderNode {
  id: string;
  name: string;
  documentCount?: number;
  children?: DocumentFolderNode[];
}

// ============================================================
// Document metadata types
// ============================================================

/** Configurable document type (caller-defined union). */
export type DocumentType = string;

/** Configurable document access level (caller-defined union). */
export type DocumentAccessLevel = string;

/** Document metadata form data. */
export interface DocumentMetadata {
  title: string;
  documentType: DocumentType;
  tags: string;
  author: string;
  date: string;
  description: string;
  accessLevel: DocumentAccessLevel;
}

// ============================================================
// Data export types
// ============================================================

/** Configurable export format (caller-defined union). */
export type ExportFormatId = string;

/** An export format option for the export dialog. */
export interface ExportFormatOption {
  id: ExportFormatId;
  label: string;
  description?: string;
}
