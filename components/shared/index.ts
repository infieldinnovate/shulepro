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
