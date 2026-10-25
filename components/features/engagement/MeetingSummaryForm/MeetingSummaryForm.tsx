"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Button, IconButton } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { FormField } from "@/components/ui/FormField";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import {
  ClipboardList,
  Plus,
  X,
  Users,
  CalendarClock,
  Save,
} from "lucide-react";
import type { MeetingSummary, DisabledState } from "@/components/features/engagement/models";
import styles from "./MeetingSummaryForm.module.scss";

export interface MeetingSummaryFormProps {
  /** Optional pre-existing summary for editing. */
  summary?: MeetingSummary | null;
  /** Callback when the form is submitted. */
  onSubmit?: (data: {
    summary: string;
    actionItems: string[];
    attendees: string[];
    followUpDate: string;
  }) => void;
  /** Optional meeting title for context. */
  meetingTitle?: string;
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

export function MeetingSummaryForm({
  summary,
  onSubmit,
  meetingTitle,
  loading = false,
  error,
  disabled,
  children,
  className,
}: MeetingSummaryFormProps) {
  const [summaryText, setSummaryText] = useState(summary?.summary ?? "");
  const [actionItems, setActionItems] = useState<string[]>(
    summary?.actionItems ?? [],
  );
  const [newAction, setNewAction] = useState("");
  const [attendees, setAttendees] = useState<string[]>(
    summary?.attendees ?? [],
  );
  const [newAttendee, setNewAttendee] = useState("");
  const [followUpDate, setFollowUpDate] = useState<string>(
    summary?.followUpDate
      ? new Date(summary.followUpDate).toISOString().slice(0, 10)
      : "",
  );

  const isDisabled = Boolean(disabled?.disabled);
  const blockInteraction = isDisabled || loading;

  const canSubmit =
    summaryText.trim().length > 0 && !blockInteraction;

  const addAction = () => {
    const trimmed = newAction.trim();
    if (!trimmed) return;
    setActionItems((prev) => [...prev, trimmed]);
    setNewAction("");
  };

  const removeAction = (idx: number) => {
    setActionItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const addAttendee = () => {
    const trimmed = newAttendee.trim();
    if (!trimmed) return;
    setAttendees((prev) => [...prev, trimmed]);
    setNewAttendee("");
  };

  const removeAttendee = (idx: number) => {
    setAttendees((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSummaryChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setSummaryText(e.target.value);
  };

  const handleActionChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewAction(e.target.value);
  };

  const handleAttendeeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewAttendee(e.target.value);
  };

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFollowUpDate(e.target.value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit?.({
      summary: summaryText.trim(),
      actionItems,
      attendees,
      followUpDate,
    });
  };

  if (loading && !summary) {
    return (
      <Card padded className={clsx(styles.loading, className)}>
        <Spinner size="md" label="Loading summary form" />
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
              <ClipboardList aria-hidden="true" />
            </span>
            <div className={styles.headerInfo}>
              <h3 className={styles.title}>
                {summary ? "Edit meeting summary" : "Record meeting summary"}
              </h3>
              {meetingTitle && (
                <p className={styles.meetingTitle}>{meetingTitle}</p>
              )}
            </div>
          </div>

          {error && (
            <Alert variant="error" title="Could not save summary" description={error} />
          )}

          {isDisabled && disabled?.disabledReason && (
            <p className={styles.disabledReason}>{disabled.disabledReason}</p>
          )}

          <FormField
            label="Summary"
            htmlFor="meeting-summary-text"
            required
            disabled={blockInteraction}
          >
            <Textarea
              id="meeting-summary-text"
              value={summaryText}
              onChange={handleSummaryChange}
              disabled={blockInteraction}
              placeholder="Summarize the discussion..."
              resize="vertical"
              textareaSize="md"
            />
          </FormField>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>
                <ClipboardList aria-hidden="true" />
              </span>
              <Label>Action items</Label>
            </div>
            <div className={styles.itemList}>
              {actionItems.map((item, idx) => (
                <div key={idx} className={styles.item}>
                  <span className={styles.itemText}>{item}</span>
                  <IconButton
                    label="Remove action item"
                    size="sm"
                    onClick={() => removeAction(idx)}
                    disabled={blockInteraction}
                  >
                    <X aria-hidden="true" />
                  </IconButton>
                </div>
              ))}
            </div>
            <div className={styles.addRow}>
              <Input
                value={newAction}
                onChange={handleActionChange}
                disabled={blockInteraction}
                placeholder="Add an action item..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addAction();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={addAction}
                disabled={blockInteraction || !newAction.trim()}
                leftIcon={<Plus aria-hidden="true" />}
              >
                Add
              </Button>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>
                <Users aria-hidden="true" />
              </span>
              <Label>Attendees</Label>
            </div>
            <div className={styles.itemList}>
              {attendees.map((item, idx) => (
                <div key={idx} className={styles.item}>
                  <span className={styles.itemText}>{item}</span>
                  <IconButton
                    label="Remove attendee"
                    size="sm"
                    onClick={() => removeAttendee(idx)}
                    disabled={blockInteraction}
                  >
                    <X aria-hidden="true" />
                  </IconButton>
                </div>
              ))}
            </div>
            <div className={styles.addRow}>
              <Input
                value={newAttendee}
                onChange={handleAttendeeChange}
                disabled={blockInteraction}
                placeholder="Add an attendee..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addAttendee();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={addAttendee}
                disabled={blockInteraction || !newAttendee.trim()}
                leftIcon={<Plus aria-hidden="true" />}
              >
                Add
              </Button>
            </div>
          </div>

          <FormField
            label="Follow-up date"
            htmlFor="meeting-followup-date"
            disabled={blockInteraction}
          >
            <div className={styles.dateRow}>
              <span className={styles.dateIcon}>
                <CalendarClock aria-hidden="true" />
              </span>
              <Input
                id="meeting-followup-date"
                type="date"
                value={followUpDate}
                onChange={handleDateChange}
                disabled={blockInteraction}
              />
            </div>
          </FormField>

          {children && <div className={styles.extra}>{children}</div>}
        </div>

        <div className={styles.footer}>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            disabled={!canSubmit}
            leftIcon={<Save aria-hidden="true" />}
          >
            Save summary
          </Button>
        </div>
      </form>
    </Card>
  );
}