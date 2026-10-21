// ============================================================
// Step 11 — Staff, parents, communications, training & policies
// Shared typed models. All roles, statuses, categories, and
// scales are configurable via props — no official Kenyan
// frameworks, statutory thresholds, or diagnostic
// classifications are hardcoded here. Pure types only: no
// runtime data, no backend calls, no persistence, no auth.
// ============================================================

// ------------------------------------------------------------
// Shared state types (reused by every component in this step)
// ------------------------------------------------------------

/** Discriminated async state for data-fetching components. */
export type AsyncState =
  | { status: "loading" }
  | { status: "empty" }
  | { status: "error"; message?: string }
  | { status: "ready" };

/** Indicates a component or action is disabled, with an optional reason. */
export interface DisabledState {
  disabled?: boolean;
  disabledReason?: string;
}

// ------------------------------------------------------------
// People references
// ------------------------------------------------------------

/** A reference to a person by id — never embeds PII. */
export type PersonRef = string;

/** A reference to a learner by id. */
export type LearnerRef = string;

/** A reference to a staff member by id. */
export type StaffRef = string;

// ------------------------------------------------------------
// Staff / people profiles
// ------------------------------------------------------------

/**
 * A configurable profile field so profile information can be
 * configured per use. The caller decides which fields appear,
 * their labels, and whether they are editable.
 */
export interface ProfileField {
  /** Stable identifier (e.g. "phone", "tscNumber"). */
  key: string;
  /** Human-readable label. */
  label: string;
  /** Current value (caller-supplied, may be string, number, or date label). */
  value: string | number | null;
  /** Optional helper text. */
  helperText?: string;
  /** Whether the field is editable by the current user. */
  editable?: boolean;
  /** Whether the field value should be masked or treated as sensitive. */
  sensitive?: boolean;
  /** Optional display order. */
  order?: number;
}

/** A configurable tab on a person/staff profile. */
export interface ProfileTab {
  /** Stable identifier. */
  id: string;
  /** Human-readable tab label. */
  label: string;
  /** Optional badge count (e.g. pending items). */
  badge?: number | null;
  /** Whether this tab is disabled. */
  disabled?: boolean;
}

/** A generic person profile — base for staff, parents, and contacts. */
export interface PersonProfile {
  id: string;
  /** Display name. */
  name: string;
  /** Optional avatar image URL. */
  avatarSrc?: string;
  /** Optional initials for avatar fallback. */
  initials?: string;
  /** Optional role or title label. */
  roleLabel?: string;
  /** Optional contact details. */
  contact?: {
    phone?: string;
    email?: string;
    addressLine?: string;
    postalCode?: string;
    town?: string;
  };
  /** Configurable profile fields. */
  fields?: ProfileField[];
  /** Configurable profile tabs. */
  tabs?: ProfileTab[];
}

/**
 * A staff member's profile. Extends PersonProfile with
 * assignment and role information — all role labels and
 * assignment types are configurable.
 */
export interface StaffProfile extends PersonProfile {
  /** Optional staff identifier (e.g. TSC number, employee id). */
  staffId?: string;
  /** Configurable role or position label. */
  role?: string;
  /** Configurable department or team label. */
  department?: string;
  /** Configurable employment-status label. */
  employmentStatus?: string;
}

/**
 * A configurable staff assignment (e.g. class teacher, subject
 * lead, duty roster). Assignment types are caller-defined.
 */
export interface StaffAssignment {
  id: string;
  /** Staff member reference. */
  staffRef: StaffRef;
  /** Display name of the staff member. */
  staffName?: string;
  /** Configurable assignment-type label (e.g. "Class Teacher"). */
  type: string;
  /** Configurable target label (e.g. "Grade 7 East"). */
  targetLabel: string;
  /** Optional target identifier (e.g. class id). */
  targetRef?: string;
  /** Optional start date. */
  startDate?: Date | string;
  /** Optional end date. */
  endDate?: Date | string;
  /** Whether this assignment is currently active. */
  active?: boolean;
}

// ------------------------------------------------------------
// Training & professional development
// ------------------------------------------------------------

/** Lifecycle status of a training course. */
export type TrainingCourseStatus =
  | "draft"
  | "scheduled"
  | "active"
  | "completed"
  | "cancelled";

/** A configurable module within a training course. */
export interface LearningModule {
  id: string;
  /** Human-readable module title. */
  title: string;
  /** Optional description. */
  description?: string;
  /** Optional estimated duration label (e.g. "2 hours"). */
  durationLabel?: string;
  /** Optional order within the course. */
  order?: number;
  /** Whether this module is required for course completion. */
  required?: boolean;
  /** Optional content/resource URL. */
  contentUrl?: string;
}

/** A configurable training course for staff professional development. */
export interface TrainingCourse {
  id: string;
  /** Human-readable course title. */
  title: string;
  /** Optional description. */
  description?: string;
  /** Configurable category or topic label. */
  category?: string;
  /** Configurable delivery-mode label (e.g. "Online", "In-person"). */
  deliveryMode?: string;
  /** Lifecycle status. */
  status: TrainingCourseStatus;
  /** Configurable modules within this course. */
  modules: LearningModule[];
  /** Optional start date. */
  startDate?: Date | string;
  /** Optional end date. */
  endDate?: Date | string;
  /** Optional provider or facilitator label. */
  provider?: string;
  /** Optional total estimated duration label. */
  durationLabel?: string;
  /** Optional number of enrolled staff (pre-computed). */
  enrolledCount?: number | null;
}

/** A record of a staff member's completion of a course or module. */
export interface CompletionRecord {
  id: string;
  /** Course reference. */
  courseRef: string;
  /** Optional module reference (if completion is per-module). */
  moduleRef?: string;
  /** Staff member reference. */
  staffRef: StaffRef;
  /** Display name of the staff member. */
  staffName?: string;
  /** Date the completion was recorded. */
  completedAt: Date | string;
  /** Optional score or grade label (caller-supplied). */
  scoreLabel?: string;
  /** Optional numeric score. */
  score?: number | null;
  /** Whether the completion passed the required threshold. */
  passed?: boolean;
}

/** Validity period for a certificate. */
export interface CertificateValidity {
  /** Date the certificate becomes valid. */
  issuedAt: Date | string;
  /** Optional expiry date. */
  expiresAt?: Date | string;
  /** Whether the certificate is currently valid (pre-computed). */
  currentlyValid?: boolean;
  /** Optional human-readable validity status label. */
  statusLabel?: string;
}

/** A certificate awarded for completing a training course. */
export interface Certificate {
  id: string;
  /** Course reference. */
  courseRef: string;
  /** Course display label. */
  courseLabel?: string;
  /** Staff member reference. */
  staffRef: StaffRef;
  /** Display name of the staff member. */
  staffName?: string;
  /** Human-readable certificate number or identifier. */
  certificateNumber?: string;
  /** Validity information. */
  validity: CertificateValidity;
  /** Optional document URL (e.g. PDF). */
  documentUrl?: string;
}

// ------------------------------------------------------------
// Policies & compliance
// ------------------------------------------------------------

/** A link to a policy document (internal or external). */
export interface PolicyDocumentLink {
  /** Stable identifier. */
  id: string;
  /** Human-readable link label. */
  label: string;
  /** Document URL or internal reference. */
  url?: string;
  /** Optional document-type label (e.g. "PDF", "Webpage"). */
  type?: string;
}

/** A configurable policy document. */
export interface PolicyDocument {
  id: string;
  /** Human-readable policy title. */
  title: string;
  /** Optional description or summary. */
  description?: string;
  /** Configurable issuer label (e.g. "Ministry of Education"). */
  issuer?: string;
  /** Version label (e.g. "2.1"). */
  version?: string;
  /** Date the policy takes effect. */
  effectiveDate?: Date | string;
  /** Optional date the policy was last reviewed. */
  lastReviewedAt?: Date | string;
  /** Optional date the policy is due for review. */
  nextReviewDate?: Date | string;
  /** Configurable category label. */
  category?: string;
  /** Configurable status label (e.g. "Active", "Draft"). */
  status?: string;
  /** Optional links to the actual documents. */
  documentLinks?: PolicyDocumentLink[];
}

/** The type of acknowledgement recorded against a policy. */
export type PolicyAcknowledgementType = "acknowledgement" | "legal-signature";

/** A recorded acknowledgement of a policy by a staff member. */
export interface PolicyAcknowledgement {
  id: string;
  /** Policy document reference. */
  policyRef: string;
  /** Staff member reference. */
  staffRef: StaffRef;
  /** Display name of the staff member. */
  staffName?: string;
  /** Whether this is a simple acknowledgement or a legal signature. */
  type: PolicyAcknowledgementType;
  /** Date the acknowledgement was recorded. */
  acknowledgedAt: Date | string;
  /** Optional confirmation text or statement that was agreed to. */
  confirmationText?: string;
}

// ------------------------------------------------------------
// Communication
// ------------------------------------------------------------

/** A broadcast announcement. */
export interface Announcement {
  id: string;
  /** Human-readable title. */
  title: string;
  /** Body content. */
  body: string;
  /** Configurable audience label (e.g. "All staff", "Parents"). */
  audience?: string;
  /** Person who published the announcement. */
  publishedByRef?: PersonRef;
  publishedByName?: string;
  /** Date the announcement was published. */
  publishedAt: Date | string;
  /** Optional priority label (caller-defined). */
  priority?: string;
  /** Optional expiry date. */
  expiresAt?: Date | string;
}

/** A single message in a conversation. */
export interface Message {
  id: string;
  /** Author person reference. */
  authorRef: PersonRef;
  authorName?: string;
  authorAvatarSrc?: string;
  /** Message content. */
  content: string;
  /** Timestamp. */
  sentAt: Date | string;
  /** Whether the message has been read by the current user. */
  read?: boolean;
}

/**
 * A message thread (conversation). The private/sensitive flag
 * is separate from general visibility — a thread can be
 * visible but flagged as containing sensitive content.
 */
export interface MessageThread {
  id: string;
  /** Human-readable subject or title. */
  subject: string;
  /** Participant person references. */
  participantRefs: PersonRef[];
  /** Optional display labels for participants. */
  participantNames?: string[];
  /** Messages in the thread. */
  messages: Message[];
  /** Timestamp of the last message. */
  lastMessageAt?: Date | string;
  /** Whether the thread is private (restricted access). */
  private?: boolean;
  /** Whether the thread contains sensitive content (separate from private). */
  sensitive?: boolean;
}

/** A conversation — alias grouping for MessageThread consumers. */
export interface Conversation {
  id: string;
  /** Human-readable title. */
  title: string;
  /** Optional preview of the most recent message. */
  preview?: string;
  /** Participant display names. */
  participantNames?: string[];
  /** Timestamp of the last activity. */
  lastActivityAt?: Date | string;
  /** Number of unread messages. */
  unreadCount?: number;
  /** Whether the conversation is private. */
  private?: boolean;
  /** Whether the conversation contains sensitive content. */
  sensitive?: boolean;
}

/** A notification item in the notification center. */
export interface NotificationItem {
  id: string;
  /** Human-readable title. */
  title: string;
  /** Optional description. */
  description?: string;
  /** Configurable category label. */
  category?: string;
  /** Timestamp. */
  createdAt: Date | string;
  /** Whether the notification has been read. */
  read?: boolean;
  /** Optional action label for the primary action. */
  actionLabel?: string;
  /** Optional drill-down target (caller-defined). */
  targetRef?: string;
}

// ------------------------------------------------------------
// Parent engagement
// ------------------------------------------------------------

/** A scheduled parent meeting. */
export interface Meeting {
  id: string;
  /** Human-readable title or purpose. */
  title: string;
  /** Configurable meeting-type label (e.g. "Parent-teacher conference"). */
  type?: string;
  /** Optional learner reference if the meeting is about a specific learner. */
  learnerRef?: LearnerRef;
  /** Optional learner display name. */
  learnerName?: string;
  /** Optional parent/guardian person reference. */
  parentRef?: PersonRef;
  parentName?: string;
  /** Scheduled date. */
  date: Date | string;
  /** Optional location label. */
  location?: string;
  /** Configurable status label (e.g. "Scheduled", "Completed"). */
  status?: string;
  /** Optional notes. */
  notes?: string;
}

/** An available time slot for booking a parent meeting. */
export interface MeetingSlot {
  id: string;
  /** Slot date. */
  date: Date | string;
  /** Start time label (caller-defined format). */
  startTime: string;
  /** End time label (caller-defined format). */
  endTime: string;
  /** Whether the slot is available for booking. */
  available: boolean;
  /** Optional booked-by person reference. */
  bookedByRef?: PersonRef;
  bookedByName?: string;
}

/** A summary of a completed meeting. */
export interface MeetingSummary {
  id: string;
  /** Reference to the meeting. */
  meetingRef: string;
  /** Summary of the discussion. */
  summary: string;
  /** Optional agreed action items. */
  actionItems?: string[];
  /** Optional follow-up date. */
  followUpDate?: Date | string;
  /** Optional attendee display names. */
  attendees?: string[];
  /** Date the summary was recorded. */
  recordedAt: Date | string;
}

/** Feedback submitted by a parent. */
export interface ParentFeedback {
  id: string;
  /** Optional parent person reference. */
  parentRef?: PersonRef;
  parentName?: string;
  /** Configurable feedback category label. */
  category?: string;
  /** Feedback content. */
  content: string;
  /** Date the feedback was submitted. */
  submittedAt: Date | string;
  /** Optional rating label (caller-defined scale). */
  ratingLabel?: string;
}

/** Configurable question type for survey questions. */
export type SurveyQuestionType =
  | "text"
  | "rating"
  | "single-choice"
  | "multi-choice"
  | "scale"
  | "boolean";

/** A configurable option for choice/scale questions. */
export interface SurveyQuestionOption {
  /** Stable value. */
  value: string;
  /** Human-readable label. */
  label: string;
}

/** A configurable question in a survey. */
export interface SurveyQuestion {
  id: string;
  /** The question text. */
  question: string;
  /** The type of response expected. */
  type: SurveyQuestionType;
  /** Options for single-choice, multi-choice, and scale questions. */
  options?: SurveyQuestionOption[];
  /** Whether the question requires a response. */
  required?: boolean;
  /** Optional helper text. */
  helperText?: string;
  /** Optional display order. */
  order?: number;
}

/** Validation rules for a survey. */
export interface SurveyValidation {
  /** Minimum number of questions that must be answered. */
  minAnswered?: number;
  /** Whether all required questions must be answered before submission. */
  enforceRequired?: boolean;
  /** Optional custom validation message. */
  message?: string;
}

/** A configurable survey for parent engagement. */
export interface Survey {
  id: string;
  /** Human-readable survey title. */
  title: string;
  /** Optional description. */
  description?: string;
  /** Configurable questions. */
  questions: SurveyQuestion[];
  /** Validation rules. */
  validation?: SurveyValidation;
  /** Optional start date. */
  startDate?: Date | string;
  /** Optional end date. */
  endDate?: Date | string;
  /** Configurable status label. */
  status?: string;
}

/** A single respondent's response to a survey. */
export interface SurveyResponse {
  id: string;
  /** Survey reference. */
  surveyRef: string;
  /** Optional respondent person reference. */
  respondentRef?: PersonRef;
  respondentName?: string;
  /** Responses keyed by question id. */
  responses: Record<string, string | string[]>;
  /** Date the response was submitted. */
  submittedAt: Date | string;
}

/** Aggregated results for a survey. */
export interface SurveyResults {
  id: string;
  /** Survey reference. */
  surveyRef: string;
  /** Total responses received. */
  responseCount: number;
  /** Optional per-question aggregated results (caller-supplied). */
  perQuestion?: {
    /** Question id. */
    questionId: string;
    /** Question label. */
    questionLabel: string;
    /** Aggregated result summary (caller-defined shape). */
    summary: string;
  }[];
  /** Optional overall summary text. */
  overallSummary?: string;
}

/** A resource in the parent resource library. */
export interface ResourceLibraryResource {
  id: string;
  /** Human-readable resource title. */
  title: string;
  /** Optional description. */
  description?: string;
  /** Configurable resource-type label (e.g. "Guide", "Video", "Article"). */
  type?: string;
  /** Optional URL. */
  url?: string;
  /** Optional thumbnail image URL. */
  thumbnail?: string;
  /** Optional category label. */
  category?: string;
  /** Optional target-audience label (e.g. "Parents of Grade 7"). */
  audience?: string;
  /** Optional language label. */
  language?: string;
}
