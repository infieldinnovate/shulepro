// ============================================================
// CBC Careers & Pathways feature — barrel exports
// ============================================================

export type {
  LearnerRef,
  PersonRef,
  CareerInterestDimension,
  CareerInterestScaleOption,
  CareerInterestResponse,
  CareerInterestProfileData,
  StrengthCategory,
  StrengthEntry,
  StrengthsProfileData,
  CareerAssessmentPrompt,
  CareerChoiceOption,
  CareerGoalStatus,
  CareerGoal,
  CareerAssessmentFormValues,
} from "./types";

export { CareerInterestProfile } from "./CareerInterestProfile";
export type { CareerInterestProfileProps } from "./CareerInterestProfile";

export { StrengthsProfile as StrengthsProfileComponent } from "./StrengthsProfile";
export type { StrengthsProfileProps } from "./StrengthsProfile";

export { CareerAssessmentForm } from "./CareerAssessmentForm";
export type { CareerAssessmentFormProps } from "./CareerAssessmentForm";

export { CareerGoalCard, DEFAULT_CAREER_GOAL_STATUS_MAP } from "./CareerGoalCard";
export type {
  CareerGoalCardProps,
  CareerGoalStatusBadgeMap,
} from "./CareerGoalCard";
