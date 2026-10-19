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
