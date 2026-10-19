// Shared, cross-feature patterns composing ui/ primitives.
// Domain-specific components live under components/features/.

export { PermissionGate } from "./PermissionGate";
export type { PermissionGateProps } from "./PermissionGate";

export { RoleDashboardRouter } from "./RoleDashboardRouter";
export type { RoleDashboardRouterProps, RoleKey } from "./RoleDashboardRouter";

export { FormSection } from "./FormSection";
export type { FormSectionProps, FormSectionVariant } from "./FormSection";

export { FormActions } from "./FormActions";
export type { FormActionsProps } from "./FormActions";

export { FormErrorSummary } from "./FormErrorSummary";
export type { FormErrorSummaryProps, FormErrorEntry } from "./FormErrorSummary";

export { UnsavedChangesDialog } from "./UnsavedChangesDialog";
export type { UnsavedChangesDialogProps } from "./UnsavedChangesDialog";

export { FormDialog, useFormContext } from "./FormDialog";
export type { FormDialogProps } from "./FormDialog";

export { FormSaveIndicator } from "./FormSaveIndicator";
export type { FormSaveIndicatorProps, FormSaveState } from "./FormSaveIndicator";

export { StepIndicator } from "./StepIndicator";
export type {
  StepIndicatorProps,
  StepIndicatorStep,
  StepStatus,
} from "./StepIndicator";

export { ReviewAndSubmit } from "./ReviewAndSubmit";
export type {
  ReviewAndSubmitProps,
  ReviewSummarySection,
  ReviewSummaryField,
} from "./ReviewAndSubmit";

export { MultiStepForm } from "./MultiStepForm";
export type {
  MultiStepFormProps,
  MultiStepFormStep,
  StepDirection,
} from "./MultiStepForm";

export { WorkflowStepper } from "./WorkflowStepper";
export type {
  WorkflowStepperProps,
  WorkflowStep,
  WorkflowStepStatus,
  WorkflowStepAssignee,
  WorkflowOrientation,
} from "./WorkflowStepper";

export { WorkflowTimeline } from "./WorkflowTimeline";
export type {
  WorkflowTimelineProps,
  WorkflowTimelineEvent,
  WorkflowTimelineActor,
  WorkflowTimelineVariant,
} from "./WorkflowTimeline";

export { ApprovalActions } from "./ApprovalActions";
export type {
  ApprovalActionsProps,
  ApprovalAction,
  ApprovalActionVariant,
} from "./ApprovalActions";

export { SignatureOrAcknowledgement } from "./SignatureOrAcknowledgement";
export type { SignatureOrAcknowledgementProps } from "./SignatureOrAcknowledgement";

export { AssigneePicker } from "./AssigneePicker";
export type { AssigneePickerProps, AssigneeOption } from "./AssigneePicker";

export { CommentBox } from "./CommentBox";
export type { CommentBoxProps } from "./CommentBox";

export { DeadlineField } from "./DeadlineField";
export type {
  DeadlineFieldProps,
  DeadlineValue,
  DeadlineRangeValue,
} from "./DeadlineField";

export { DataTable } from "./DataTable";
export type {
  DataTableProps,
  DataTableState,
  DataTableFeatures,
  DataTableSortState,
  DataTableSortDir,
  DataTablePaginationState,
  DataTableColumnVisibilityState,
  DataTableRowSelectionState,
} from "./DataTable";

export { DataTableColumnHeader } from "./DataTableColumnHeader";
export type { DataTableColumnHeaderProps } from "./DataTableColumnHeader";

export { DataTablePagination } from "./DataTablePagination";
export type { DataTablePaginationProps } from "./DataTablePagination";

export { DataTableToolbar } from "./DataTableToolbar";
export type { DataTableToolbarProps } from "./DataTableToolbar";

export { DataTableRowActions } from "./DataTableRowActions";
export type {
  DataTableRowActionsProps,
  DataTableRowActionItem,
} from "./DataTableRowActions";

export { SearchInput } from "./SearchInput";
export type { SearchInputProps } from "./SearchInput";

export { FilterBar } from "./FilterBar";
export type { FilterBarProps } from "./FilterBar";

export { FilterChips } from "./FilterChips";
export type { FilterChipsProps, FilterChip } from "./FilterChips";

export { BulkActionBar } from "./BulkActionBar";
export type {
  BulkActionBarProps,
  BulkAction,
  BulkActionConfirm,
} from "./BulkActionBar";

export { SavedViewSelector } from "./SavedViewSelector";
export type { SavedViewSelectorProps, SavedView } from "./SavedViewSelector";

export { StatusBadge } from "./StatusBadge";
export type {
  StatusBadgeProps,
  StatusBadgeMap,
  StatusBadgeMapping,
} from "./StatusBadge";

export { PriorityBadge } from "./PriorityBadge";
export type {
  PriorityBadgeProps,
  PriorityBadgeMap,
  PriorityBadgeMapping,
} from "./PriorityBadge";

export { RecordSummaryCard, Avatar } from "./RecordSummaryCard";
export type { RecordSummaryCardProps } from "./RecordSummaryCard";

export { RecordDetailPanel } from "./RecordDetailPanel";
export type {
  RecordDetailPanelProps,
  RecordDetailField,
  RecordDetailSection,
} from "./RecordDetailPanel";

export { RecordFormDialog } from "./RecordFormDialog";
export type { RecordFormDialogProps } from "./RecordFormDialog";

export { ConfirmActionDialog } from "./ConfirmActionDialog";
export type { ConfirmActionDialogProps } from "./ConfirmActionDialog";

export { ActivityTimeline } from "./ActivityTimeline";
export type {
  ActivityTimelineProps,
  ActivityTimelineEvent,
  ActivityTimelineVariant,
  ActivityTimelineActor,
} from "./ActivityTimeline";

export { AuditTrail } from "./AuditTrail";
export type { AuditTrailProps, AuditTrailEvent } from "./AuditTrail";

export { FileUploader, formatBytes } from "./FileUploader";
export type { FileUploaderProps, FileValidationIssue } from "./FileUploader";

export { AttachmentList } from "./AttachmentList";
export type { AttachmentListProps, Attachment } from "./AttachmentList";

export { DocumentViewer } from "./DocumentViewer";
export type { DocumentViewerProps, DocumentViewerDocument } from "./DocumentViewer";

export { ExportMenu } from "./ExportMenu";
export type { ExportMenuProps, ExportFormat } from "./ExportMenu";

export { ImportValidationResults } from "./ImportValidationResults";
export type {
  ImportValidationResultsProps,
  ImportValidationResultEntry,
  ImportValidationSummary,
  ImportValidationRowStatus,
} from "./ImportValidationResults";

export { ImportWizard } from "./ImportWizard";
export type {
  ImportWizardProps,
  ImportTargetField,
  ImportMapping,
} from "./ImportWizard";
