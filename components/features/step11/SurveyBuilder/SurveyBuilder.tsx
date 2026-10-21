"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import clsx from "clsx";
import { Card } from "../../../ui/Card";
import { Button } from "../../../ui/Button";
import { Input } from "../../../ui/Input";
import { Label } from "../../../ui/Label";
import { Textarea } from "../../../ui/Textarea";
import { FormField } from "../../../ui/FormField";
import { Select } from "../../../ui/Select";
import { Checkbox } from "../../../ui/Checkbox";
import { Spinner } from "../../../ui/Spinner";
import { Alert } from "../../../ui/Alert";
import {
  ClipboardList,
  Plus,
  X,
  Save,
  Eye,
  Trash2,
  GripVertical,
} from "lucide-react";
import type {
  Survey,
  SurveyQuestion,
  SurveyQuestionType,
  SurveyQuestionOption,
  SurveyValidation,
  DisabledState,
} from "../models";
import styles from "./SurveyBuilder.module.scss";

export interface SurveyBuilderProps {
  /** Optional pre-existing survey for editing. */
  survey?: Survey | null;
  /** Callback when the survey is saved. */
  onSave?: (survey: Survey) => void;
  /** Callback to preview the survey. */
  onPreview?: (survey: Survey) => void;
  /** Loading state — disables actions and shows spinner. */
  loading?: boolean;
  /** Error message — shows an error alert. */
  error?: string;
  /** Disabled state — dims and blocks interaction. */
  disabled?: DisabledState;
  /** Optional slot for extra content. */
  children?: ReactNode;
  className?: string;
}

interface QuestionValidation {
  minLength?: number;
  maxLength?: number;
  minSelections?: number;
  maxSelections?: number;
}

const QUESTION_TYPE_OPTIONS: { value: SurveyQuestionType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "rating", label: "Rating" },
  { value: "single-choice", label: "Single choice" },
  { value: "multi-choice", label: "Multi choice" },
  { value: "scale", label: "Scale" },
  { value: "boolean", label: "Yes / No" },
];

const NEEDS_OPTIONS: SurveyQuestionType[] = [
  "single-choice",
  "multi-choice",
  "scale",
];

function genId(): string {
  return `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function createEmptyQuestion(order: number): SurveyQuestion {
  return {
    id: genId(),
    question: "",
    type: "text",
    required: false,
    order,
  };
}

export function SurveyBuilder({
  survey,
  onSave,
  onPreview,
  loading = false,
  error,
  disabled,
  children,
  className,
}: SurveyBuilderProps) {
  const [title, setTitle] = useState(survey?.title ?? "");
  const [description, setDescription] = useState(survey?.description ?? "");
  const [questions, setQuestions] = useState<SurveyQuestion[]>(
    survey?.questions ?? [],
  );
  const [validation, setValidation] = useState<SurveyValidation>(
    survey?.validation ?? {},
  );
  const [questionValidation, setQuestionValidation] = useState<
    Record<string, QuestionValidation>
  >({});

  const isDisabled = Boolean(disabled?.disabled);
  const blockInteraction = isDisabled || loading;

  const hasQuestions = questions.length > 0;
  const canSave = title.trim().length > 0 && hasQuestions && !blockInteraction;

  const addQuestion = () => {
    if (blockInteraction) return;
    setQuestions((prev) => [
      ...prev,
      createEmptyQuestion(prev.length),
    ]);
  };

  const updateQuestion = (id: string, patch: Partial<SurveyQuestion>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...patch } : q)),
    );
  };

  const removeQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const moveQuestion = (id: string, direction: "up" | "down") => {
    setQuestions((prev) => {
      const idx = prev.findIndex((q) => q.id === id);
      if (idx === -1) return prev;
      const swapWith = direction === "up" ? idx - 1 : idx + 1;
      if (swapWith < 0 || swapWith >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
      return next.map((q, i) => ({ ...q, order: i }));
    });
  };

  const addOption = (questionId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: [
                ...(q.options ?? []),
                { value: `opt_${(q.options?.length ?? 0) + 1}`, label: "" },
              ],
            }
          : q,
      ),
    );
  };

  const updateOption = (
    questionId: string,
    optIndex: number,
    patch: Partial<SurveyQuestionOption>,
  ) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId || !q.options) return q;
        return {
          ...q,
          options: q.options.map((o, i) =>
            i === optIndex ? { ...o, ...patch } : o,
          ),
        };
      }),
    );
  };

  const removeOption = (questionId: string, optIndex: number) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId || !q.options) return q;
        return {
          ...q,
          options: q.options.filter((_, i) => i !== optIndex),
        };
      }),
    );
  };

  const updateQuestionValidation = (
    questionId: string,
    patch: Partial<QuestionValidation>,
  ) => {
    setQuestionValidation((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], ...patch },
    }));
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setTitle(e.target.value);
  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) =>
    setDescription(e.target.value);

  const buildSurvey = (): Survey => ({
    id: survey?.id ?? genId(),
    title: title.trim(),
    description: description.trim() || undefined,
    questions: questions.map((q, i) => ({ ...q, order: i })),
    validation,
  });

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    onSave?.(buildSurvey());
  };

  const handlePreview = () => {
    if (blockInteraction) return;
    onPreview?.(buildSurvey());
  };

  if (loading && !survey) {
    return (
      <Card padded className={clsx(styles.loading, className)}>
        <Spinner size="md" label="Loading survey builder" />
      </Card>
    );
  }

  return (
    <Card
      padded={false}
      className={clsx(
        styles.builder,
        isDisabled && styles.disabled,
        className,
      )}
      aria-disabled={isDisabled || undefined}
    >
      <form onSubmit={handleSave}>
        <div className={styles.body}>
          <div className={styles.header}>
            <span className={styles.headerIcon}>
              <ClipboardList aria-hidden="true" />
            </span>
            <h3 className={styles.title}>
              {survey ? "Edit survey" : "Build a survey"}
            </h3>
          </div>

          {error && (
            <Alert variant="error" title="Could not save survey" description={error} />
          )}

          {isDisabled && disabled?.disabledReason && (
            <p className={styles.disabledReason}>{disabled.disabledReason}</p>
          )}

          <FormField
            label="Survey title"
            htmlFor="survey-title"
            required
            disabled={blockInteraction}
          >
            <Input
              id="survey-title"
              value={title}
              onChange={handleTitleChange}
              disabled={blockInteraction}
              placeholder="e.g. Parent satisfaction survey"
            />
          </FormField>

          <FormField
            label="Description"
            htmlFor="survey-description"
            disabled={blockInteraction}
          >
            <Textarea
              id="survey-description"
              value={description}
              onChange={handleDescriptionChange}
              disabled={blockInteraction}
              placeholder="Optional description for respondents..."
              resize="vertical"
            />
          </FormField>

          <div className={styles.questionsSection}>
            <div className={styles.questionsHeader}>
              <Label>Questions</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addQuestion}
                disabled={blockInteraction}
                leftIcon={<Plus aria-hidden="true" />}
              >
                Add question
              </Button>
            </div>

            {questions.length === 0 && (
              <p className={styles.noQuestions}>
                No questions yet. Click &ldquo;Add question&rdquo; to start.
              </p>
            )}

            {questions.map((q, idx) => {
              const needsOptions = NEEDS_OPTIONS.includes(q.type);
              const qVal = questionValidation[q.id] ?? {};
              return (
                <div key={q.id} className={styles.questionCard}>
                  <div className={styles.questionHeader}>
                    <span className={styles.questionNumber}>
                      <GripVertical aria-hidden="true" />
                      <span>{idx + 1}</span>
                    </span>
                    <div className={styles.questionControls}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moveQuestion(q.id, "up")}
                        disabled={blockInteraction || idx === 0}
                        aria-label="Move question up"
                      >
                        ↑
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moveQuestion(q.id, "down")}
                        disabled={blockInteraction || idx === questions.length - 1}
                        aria-label="Move question down"
                      >
                        ↓
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(q.id)}
                        disabled={blockInteraction}
                        aria-label="Remove question"
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </div>
                  </div>

                  <FormField
                    label="Question text"
                    htmlFor={`q-${q.id}-text`}
                    required
                    disabled={blockInteraction}
                  >
                    <Input
                      id={`q-${q.id}-text`}
                      value={q.question}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateQuestion(q.id, { question: e.target.value })
                      }
                      disabled={blockInteraction}
                      placeholder="Enter your question..."
                    />
                  </FormField>

                  <FormField
                    label="Response type"
                    htmlFor={`q-${q.id}-type`}
                    disabled={blockInteraction}
                  >
                    <Select
                      id={`q-${q.id}-type`}
                      value={q.type}
                      options={QUESTION_TYPE_OPTIONS}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                        updateQuestion(q.id, {
                          type: e.target.value as SurveyQuestionType,
                        })
                      }
                      disabled={blockInteraction}
                    />
                  </FormField>

                  <FormField
                    label="Helper text"
                    htmlFor={`q-${q.id}-helper`}
                    disabled={blockInteraction}
                  >
                    <Input
                      id={`q-${q.id}-helper`}
                      value={q.helperText ?? ""}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateQuestion(q.id, { helperText: e.target.value })
                      }
                      disabled={blockInteraction}
                      placeholder="Optional guidance..."
                    />
                  </FormField>

                  <Checkbox
                    label="Required"
                    checked={q.required ?? false}
                    onChange={(e) =>
                      updateQuestion(q.id, { required: e.target.checked })
                    }
                    disabled={blockInteraction}
                  />

                  {q.type === "text" && (
                    <div className={styles.validationRow}>
                      <FormField
                        label="Min length"
                        htmlFor={`q-${q.id}-minlen`}
                        disabled={blockInteraction}
                      >
                        <Input
                          id={`q-${q.id}-minlen`}
                          type="number"
                          inputSize="sm"
                          value={qVal.minLength ?? ""}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            updateQuestionValidation(q.id, {
                              minLength: e.target.value
                                ? parseInt(e.target.value, 10)
                                : undefined,
                            })
                          }
                          disabled={blockInteraction}
                        />
                      </FormField>
                      <FormField
                        label="Max length"
                        htmlFor={`q-${q.id}-maxlen`}
                        disabled={blockInteraction}
                      >
                        <Input
                          id={`q-${q.id}-maxlen`}
                          type="number"
                          inputSize="sm"
                          value={qVal.maxLength ?? ""}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            updateQuestionValidation(q.id, {
                              maxLength: e.target.value
                                ? parseInt(e.target.value, 10)
                                : undefined,
                            })
                          }
                          disabled={blockInteraction}
                        />
                      </FormField>
                    </div>
                  )}

                  {q.type === "multi-choice" && (
                    <div className={styles.validationRow}>
                      <FormField
                        label="Min selections"
                        htmlFor={`q-${q.id}-minsel`}
                        disabled={blockInteraction}
                      >
                        <Input
                          id={`q-${q.id}-minsel`}
                          type="number"
                          inputSize="sm"
                          value={qVal.minSelections ?? ""}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            updateQuestionValidation(q.id, {
                              minSelections: e.target.value
                                ? parseInt(e.target.value, 10)
                                : undefined,
                            })
                          }
                          disabled={blockInteraction}
                        />
                      </FormField>
                      <FormField
                        label="Max selections"
                        htmlFor={`q-${q.id}-maxsel`}
                        disabled={blockInteraction}
                      >
                        <Input
                          id={`q-${q.id}-maxsel`}
                          type="number"
                          inputSize="sm"
                          value={qVal.maxSelections ?? ""}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            updateQuestionValidation(q.id, {
                              maxSelections: e.target.value
                                ? parseInt(e.target.value, 10)
                                : undefined,
                            })
                          }
                          disabled={blockInteraction}
                        />
                      </FormField>
                    </div>
                  )}

                  {needsOptions && (
                    <div className={styles.optionsSection}>
                      <Label>Options</Label>
                      {(q.options ?? []).map((opt, optIdx) => (
                        <div key={optIdx} className={styles.optionRow}>
                          <Input
                            value={opt.label}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              updateOption(q.id, optIdx, {
                                label: e.target.value,
                                value: e.target.value
                                  .toLowerCase()
                                  .replace(/\s+/g, "_"),
                              })
                            }
                            disabled={blockInteraction}
                            placeholder={`Option ${optIdx + 1}`}
                            inputSize="sm"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOption(q.id, optIdx)}
                            disabled={blockInteraction}
                            aria-label="Remove option"
                          >
                            <X aria-hidden="true" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addOption(q.id)}
                        disabled={blockInteraction}
                        leftIcon={<Plus aria-hidden="true" />}
                      >
                        Add option
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}

          {hasQuestions && (
            <div className={styles.surveyValidation}>
              <Label>Survey validation</Label>
              <div className={styles.validationRow}>
                <FormField
                  label="Min answered"
                  htmlFor="survey-min-answered"
                  disabled={blockInteraction}
                >
                  <Input
                    id="survey-min-answered"
                    type="number"
                    inputSize="sm"
                    value={validation.minAnswered ?? ""}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setValidation((prev) => ({
                        ...prev,
                        minAnswered: e.target.value
                          ? parseInt(e.target.value, 10)
                          : undefined,
                      }))
                    }
                    disabled={blockInteraction}
                  />
                </FormField>
                <Checkbox
                  label="Enforce required questions"
                  checked={validation.enforceRequired ?? false}
                  onChange={(e) =>
                    setValidation((prev) => ({
                      ...prev,
                      enforceRequired: e.target.checked,
                    }))
                  }
                  disabled={blockInteraction}
                />
              </div>
              <FormField
                label="Validation message"
                htmlFor="survey-validation-msg"
                disabled={blockInteraction}
              >
                <Input
                  id="survey-validation-msg"
                  value={validation.message ?? ""}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setValidation((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                  disabled={blockInteraction}
                  placeholder="Optional custom message..."
                  inputSize="sm"
                />
              </FormField>
            </div>
          )}
        </div>
        </div>

        {children && <div className={styles.extra}>{children}</div>}

        <div className={styles.footer}>
          {onPreview && (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handlePreview}
              disabled={blockInteraction || !hasQuestions || !title.trim()}
              leftIcon={<Eye aria-hidden="true" />}
            >
              Preview
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            disabled={!canSave}
            leftIcon={<Save aria-hidden="true" />}
          >
            Save survey
          </Button>
        </div>
      </form>
    </Card>
  );
}