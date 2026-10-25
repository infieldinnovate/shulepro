import type { ReactNode } from "react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Lock, AlertTriangle, MessageCircle } from "lucide-react";
import type { Conversation } from "@/components/features/engagement/models";
import styles from "./ConversationList.module.scss";

export interface ConversationListProps {
  /** Conversations — supplied via props, never fetched. */
  conversations?: Conversation[] | null;
  /** Currently selected conversation id. */
  selectedId?: string;
  /** Callback when a conversation is selected. */
  onSelectConversation?: (id: string) => void;
  /** Loading state. */
  loading?: boolean;
  /** Error message. */
  error?: string;
  /** Empty state. */
  empty?: boolean;
  /** Optional header slot rendered above the list. */
  header?: ReactNode;
  className?: string;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelectConversation,
  loading = false,
  error,
  empty = false,
  header,
  className,
}: ConversationListProps) {
  if (loading) {
    return (
      <Card padded className={clsx(styles.loading, className)}>
        <Spinner size="md" label="Loading conversations" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card padded className={className}>
        <Alert
          variant="error"
          title="Unable to load conversations"
          description={error}
        />
      </Card>
    );
  }

  const list = conversations ?? [];

  if (empty || list.length === 0) {
    return (
      <Card padded className={clsx(styles.empty, className)}>
        <EmptyState
          icon={<MessageCircle aria-hidden="true" />}
          title="No conversations"
          description="There are no conversations to display."
        />
      </Card>
    );
  }

  return (
    <Card padded={false} className={clsx(styles.list, className)}>
      {header && <div className={styles.header}>{header}</div>}
      <ul className={styles.items}>
        {list.map((conv) => {
          const isSelected = conv.id === selectedId;
          const hasUnread = (conv.unreadCount ?? 0) > 0;

          return (
            <li key={conv.id} className={styles.itemWrapper}>
              <button
                type="button"
                className={clsx(
                  styles.item,
                  isSelected && styles.selected,
                  hasUnread && styles.unread,
                )}
                aria-current={isSelected || undefined}
                onClick={() => onSelectConversation?.(conv.id)}
              >
                <div className={styles.itemMain}>
                  <div className={styles.itemTopRow}>
                    <span className={styles.itemTitle}>{conv.title}</span>
                    {hasUnread && (
                      <Badge variant="primary" size="sm" className={styles.unreadBadge}>
                        {conv.unreadCount}
                      </Badge>
                    )}
                  </div>
                  {conv.preview && (
                    <p className={styles.preview}>{conv.preview}</p>
                  )}
                  <div className={styles.itemMeta}>
                    {conv.participantNames &&
                      conv.participantNames.length > 0 && (
                        <span className={styles.participants}>
                          {conv.participantNames.slice(0, 3).join(", ")}
                          {conv.participantNames.length > 3 &&
                            ` +${conv.participantNames.length - 3}`}
                        </span>
                      )}
                    {conv.private && (
                      <span className={styles.flag} data-flag="private">
                        <Lock aria-hidden="true" />
                        <span>Private</span>
                      </span>
                    )}
                    {conv.sensitive && (
                      <span className={styles.flag} data-flag="sensitive">
                        <AlertTriangle aria-hidden="true" />
                        <span>Sensitive</span>
                      </span>
                    )}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
