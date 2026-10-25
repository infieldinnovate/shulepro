// Shared domain models and TypeScript interfaces for the
// Kenyan CBC school management platform.
// Feature-specific types should be added alongside the relevant
// domain area and re-exported from here when shared across features.

/** A reference to a person by id — never embeds PII. */
export type PersonRef = string;

/** A reference to a learner by id. */
export type LearnerRef = string;

/** A reference to a learning area (id or key). */
export type LearningAreaRef = string;
