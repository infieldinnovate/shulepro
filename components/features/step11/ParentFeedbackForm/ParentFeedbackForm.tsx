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
import { RadioGroup } from "../../../ui/RadioGroup";
import { Spinner } from "../../../ui/Spinner";
import { Alert } from "../../../ui/Alert";
import {
  MessageSquare,
  Plus,
  X,
  Send,
} from "lucide-react";
import type { ParentFeedback, DisabledState } from "../models";
import styles from "./ParentFeedbackForm.module.scss";

export interface ParentFeedbackFormProps {
  /** Optional pre-existing feedback for editing. */
  feedback?: ParentFeedback | null;
  /** Optional rating options (caller-defined labels). */
  ratingOptions?: { value: string; label: string }[];
  /** Optional feedback category options. */
  categoryOptions?: { value: string; label: string }[];
  /** Callback when the form is submitted. */
  onSubmit?: (data: {
    content: string;
    ratingLabel?: string;
    category?: string;
    tags: string[];
  }) => void;
  /** Loading state — disables submit and shows spinner. */
  loading?: boolean;
  /** Error message — shows an error alert. */
  error?: string;
  /** Disabled state — dims and blocks interaction. */
  disabled?: DisabledState;
  /** Optional slot for extra content. */
  children?: ReactNode;
  className?: string;
}

const DEFAULT_RATING_OPTIONS = [
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
];

export function ParentFeedbackForm({
  feedback,
  ratingOptions = DEFAULT_RATING_OPTIONS,
  categoryOptions = [],
  onSubmit,
  loading = false,
  error,
  disabled,
  children,
  className,
}: ParentFeedbackFormProps) {
  const [content, setContent] = useState(feedback?.content ?? "");
  const [rating, setRating] = useState(feedback?.ratingLabel ?? "");
  const [category, setCategory] = useState(feedback?.category ?? "");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  const isDisabled = Boolean(disabled?.disabled);
  const blockInteraction = isDisabled || loading;
  const canSubmit = content.trim().length > 0 && !blockInteraction;

  const addTag = () => {
    const trimmed = newTag.trim();
    if (!trimmed) return;
    setTags((prev) => [...prev, trimmed]);
    setNewTag("");
  };

  const removeTag = (idx: number) => {
    setTags((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleTagChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewTag(e.target.value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit?.({
      content: content.trim(),
      ratingLabel: rating || undefined,
      category: category || undefined,
      tags,
    });
  };

  if (loading && !feedback) {
    return (
      <Card padded className={clsx(styles.loading, className)}>
        <Spinner size="md" label="Loading feedback form" />
      </Card>
    );
  }

  return (
    <Card
      padded={false}
      className={clsx(
        styles.form,
        isDisabled && styles.disabled,
        className,
      )}
      aria-disabled={isDisabled || undefined}
    >
      <form onSubmit={handleSubmit}>
        <div className={styles.body}>
          <div className={styles.header}>
            <span className={styles.headerIcon}>
              <MessageSquare aria-hidden="true" />
            </span>
            <h3 className={styles.title}>
              {feedback ? "Edit feedback" : "Share your feedback"}
            </h3>
          </div>

          {error && (
            <Alert variant="error" title="Could not submit feedback" description={error} />
          )}

          {isDisabled && disabled?.disabledReason && (
            <p className={styles.disabledReason}>{disabled.disabledReason}</p>
          )}

          {ratingOptions.length > 0 && (
            <FormField
              label="Overall rating"
              disabled={blockInteraction}
            >
              <RadioGroup
                value={rating}
                onChange={setRating}
                options={ratingOptions.map((o) => ({
                  value: o.value,
                  label: o.label,
                  disabled: blockInteraction,
                }))}
                layout="horizontal"
                disabled={blockInteraction}
              />
            </FormField>
          )}

          {categoryOptions.length > 0 && (
            <>
              <FormField
                label="Category"
                htmlFor="feedback-category"
                disabled={blockInteraction}
              >
                <Input
                  id="feedback-category"
                  value={category}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setCategory(e.target.value)
                  }
                  disabled={blockInteraction}
                  placeholder="Select or type a category..."
                  list="feedback-category-list"
                />
              </FormField>
              <datalist id="feedback-category-list">
                {categoryOptions.map((o) => (
                  <option key={o.value} value={o.label} />
                ))}
              </datalist>
            </>
          )}

          <FormField
            label="Your feedback"
            htmlFor="feedback-content"
            required
            disabled={blockInteraction}
          >
            <Textarea
              id="feedback-content"
              value={content}
              onChange={handleContentChange}
              disabled={blockInteraction}
              placeholder="Tell us what you think..."
              resize="vertical"
              textareaSize="md"
            />
          </FormField>

          <div className={styles.section}>
            <Label>Tags</Label>
            {tags.length > 0 && (
              <div className={styles.tagList}>
                {tags.map((tag, idx) => (
                  <span key={idx} className={styles.tag}>
                    {tag}
                    <button
                      type="button"
                      className={styles.tagRemove}
                      onClick={() => removeTag(idx)}
                      disabled={blockInteraction}
                      aria-label={`Remove tag ${tag}`}
                    >
                      <X aria-hidden="true" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className={styles.addRow}>
              <Input
                value={newTag}
                onChange={handleTagChange}
                disabled={blockInteraction}
                placeholder="Add a tag..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={addTag}
                disabled={blockInteraction || !newTag.trim()}
                leftIcon={<Plus aria-hidden="true" />}
              >
                Add
              </Button>
            </div>
          </div>

          {children && <div className={styles.extra}>{children}</div>}
        </div>

        <div className={styles.footer}>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            disabled={!canSubmit}
            leftIcon={<Send aria-hidden="true" />}
          >
            Submit feedback
          </Button>
        </div>
      </form>
    </Card>
  );
}