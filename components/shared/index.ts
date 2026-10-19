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
