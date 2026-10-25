"use client";

import { useState } from "react";
import type { ChangeEvent, KeyboardEvent, ReactNode } from "react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import { Lock, AlertTriangle, Send, MessageCircle } from "lucide-react";
import type { MessageThread as MessageThreadModel, DisabledState } from "@/components/features/engagement/models";
import styles from "./MessageThread.module.scss";

export interface MessageThreadProps {
  /** The conversation thread — supplied via props, never fetched. */
  thread?: MessageThreadModel | null;
  /** Callback when the user sends a message. */
  onSend?: (content: string) => void;
  /** Loading state. */
  loading?: boolean;
  /** Error message. */
  error?: string;
  /** Empty state. */
  empty?: boolean;
  /** Disabled state — blocks the send area. */
  disabled?: DisabledState;
  /** Placeholder text for the compose area. */
  sendPlaceholder?: string;
  /** Optional header slot rendered above the messages. */
  header?: ReactNode;
  className?: string;
}

function formatTimeLabel(value?: Date | string): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (date instanceof Date && !Number.isNaN(date.getTime())) {
    return date.toLocaleString();
  }
  return typeof value === "string" ? value : "";
}

export function MessageThread({
  thread,
  onSend,
  loading = false,
  error,
  empty = false,
  disabled,
  sendPlaceholder = "Type a message...",
  header,
  className,
}: MessageThreadProps) {
  const [draft, setDraft] = useState("");

  const isDisabled = Boolean(disabled?.disabled);

  const handleSend = () => {
    if (!draft.trim() || isDisabled || loading) return;
    onSend?.(draft.trim());
    setDraft("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <Card padded className={clsx(styles.loading, className)}>
        <Spinner size="md" label="Loading messages" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card padded className={className}>
        <Alert variant="error" title="Unable to load messages" description={error} />
      </Card>
    );
  }

  if (empty || !thread) {
    return (
      <Card padded className={clsx(styles.empty, className)}>
        <EmptyState
          icon={<MessageCircle aria-hidden="true" />}
          title="No conversation"
          description="Select a conversation to view its messages."
        />
      </Card>
    );
  }

  const generalMessages = thread.messages.filter((m) => !m.read || thread.messages.indexOf(m) >= 0);
  const sensitiveMessages = thread.sensitive ? thread.messages : [];

  return (
    <Card
      padded={false}
      className={clsx(styles.thread, isDisabled && styles.disabled, className)}
      aria-disabled={isDisabled || undefined}
    >
      {header && <div className={styles.header}>{header}</div>}

      <div className={styles.subjectBar}>
        <h3 className={styles.subject}>{thread.subject}</h3>
        <div className={styles.flags}>
          {thread.private && (
            <span className={styles.flag} data-flag="private">
              <Lock aria-hidden="true" />
              <span>Private</span>
            </span>
          )}
          {thread.sensitive && (
            <span className={styles.flag} data-flag="sensitive">
              <AlertTriangle aria-hidden="true" />
              <span>Sensitive</span>
            </span>
          )}
        </div>
      </div>

      {thread.participantNames && thread.participantNames.length > 0 && (
        <div className={styles.participants}>
          {thread.participantNames.join(", ")}
        </div>
      )}

      <div className={styles.messages}>
        {generalMessages.length === 0 && !thread.sensitive && (
          <p className={styles.noMessages}>No messages yet.</p>
        )}
        {generalMessages.map((msg) => (
          <div key={msg.id} className={styles.message}>
            <Avatar
              src={msg.authorAvatarSrc}
              name={msg.authorName}
              size="sm"
              className={styles.avatar}
            />
            <div className={styles.messageBody}>
              <div className={styles.messageMeta}>
                <span className={styles.author}>
                  {msg.authorName ?? "Unknown"}
                </span>
                <time className={styles.timestamp}>
                  {formatTimeLabel(msg.sentAt)}
                </time>
              </div>
              <p className={styles.content}>{msg.content}</p>
            </div>
          </div>
        ))}
      </div>

      {thread.sensitive && sensitiveMessages.length > 0 && (
        <div className={styles.sensitiveSection}>
          <div className={styles.sensitiveHeader}>
            <AlertTriangle aria-hidden="true" />
            <span>Sensitive content — handle with care</span>
          </div>
          <div className={styles.sensitiveMessages}>
            {sensitiveMessages.map((msg) => (
              <div key={`sensitive-${msg.id}`} className={styles.sensitiveMessage}>
                <div className={styles.messageMeta}>
                  <span className={styles.author}>
                    {msg.authorName ?? "Unknown"}
                  </span>
                  <time className={styles.timestamp}>
                    {formatTimeLabel(msg.sentAt)}
                  </time>
                </div>
                <p className={styles.content}>{msg.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {isDisabled && disabled?.disabledReason && (
        <p className={styles.disabledReason}>{disabled.disabledReason}</p>
      )}

      <div className={styles.compose}>
        <Textarea
          value={draft}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            setDraft(e.target.value)
          }
          onKeyDown={handleKeyDown}
          placeholder={sendPlaceholder}
          disabled={isDisabled || loading}
          resize="none"
          textareaSize="sm"
          aria-label="Message"
          className={styles.composeInput}
        />
        <Button
          variant="primary"
          size="md"
          disabled={isDisabled || loading || !draft.trim()}
          loading={loading}
          onClick={handleSend}
          leftIcon={<Send aria-hidden="true" />}
        >
          Send
        </Button>
      </div>
    </Card>
  );
}