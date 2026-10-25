// ============================================================
// Programmes & campaigns feature — barrel exports
// ============================================================

export type {
  ProgrammeStatus,
  ProgrammeObjective,
  ProgrammeAudience,
  Programme,
  CampaignActivity,
  CampaignParticipantSummary,
  CampaignTarget,
  CampaignOutcome,
  Campaign,
  CampaignFormValues,
} from "./types";

export { ProgrammeCard } from "./ProgrammeCard";
export type { ProgrammeCardProps } from "./ProgrammeCard";

export { CampaignCard } from "./CampaignCard";
export type { CampaignCardProps } from "./CampaignCard";

export { CampaignForm } from "./CampaignForm";
export type { CampaignFormProps } from "./CampaignForm";

export { CampaignProgressTracker } from "./CampaignProgressTracker";
export type { CampaignProgressTrackerProps } from "./CampaignProgressTracker";

export { CampaignOutcomePanel } from "./CampaignOutcomePanel";
export type { CampaignOutcomePanelProps } from "./CampaignOutcomePanel";

// --- 10G: Clubs, events, participation register, achievements ---

export type {
  Club,
  ActivityEventType,
  ActivityEvent,
  ParticipationStatusOption,
  ParticipationRecord,
  ParticipationColumn,
  Achievement,
} from "./types";

export { ClubCard } from "./ClubCard";
export type { ClubCardProps } from "./ClubCard";

export { ActivityEventCard } from "./ActivityEventCard";
export type { ActivityEventCardProps } from "./ActivityEventCard";

export { ParticipationRegister } from "./ParticipationRegister";
export type { ParticipationRegisterProps } from "./ParticipationRegister";

export { AchievementCard } from "./AchievementCard";
export type { AchievementCardProps } from "./AchievementCard";

// --- 10H: Mentorship, champions, student reflections ---

export type {
  PersonRef,
  PersonSummary,
  MentorshipSession,
  ChampionProfile,
  StudentReflection,
} from "./types";

export { MentorshipSessionCard } from "./MentorshipSessionCard";
export type { MentorshipSessionCardProps } from "./MentorshipSessionCard";

export { ChampionProfileCard } from "./ChampionProfileCard";
export type { ChampionProfileCardProps } from "./ChampionProfileCard";

export { StudentReflectionCard } from "./StudentReflectionCard";
export type { StudentReflectionCardProps } from "./StudentReflectionCard";
