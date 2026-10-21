import type { ReactNode } from "react";
import {
  CalendarDays,
  Users,
  Target,
  ListChecks,
  CheckCircle2,
  Circle,
  CircleDot,
} from "lucide-react";
import clsx from "clsx";
import { Card } from "../../../ui/Card";
import { Badge } from "../../../ui/Badge";
import { Spinner } from "../../../ui/Spinner";
import { Alert } from "../../../ui/Alert";
import { EmptyState } from "../../../ui/EmptyState";
import type { BadgeVariant } from "../../../ui/Badge";
import type {
  Campaign,
  ProgrammeStatus,
  CampaignActivity,
} from "../types";
import styles from "./CampaignCard.module.scss";

export interface CampaignCardProps {
  /** Configurable campaign to display. */
  campaign: Campaign | null;
  loading?: boolean;
  error?: string;
  /** Optional content rendered below the campaign details. */
  children?: ReactNode;
  className?: string;
}

const STATUS_VARIANT: Record<ProgrammeStatus, BadgeVariant> = {
  planned: "info",
  active: "success",
  paused: "warning",
  completed: "neutral",
  cancelled: "error",
};

const STATUS_LABEL: Record<ProgrammeStatus, string> = {
  planned: "Planned",
  active: "Active",
  paused: "Paused",
  completed: "Completed",
  cancelled: "Cancelled",
};

function formatDate(date: string | Date | undefined): string | null {
  if (!date) return null;
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ActivityIcon({ status }: { status?: ProgrammeStatus }) {
  switch (status) {
    case "completed":
      return <CheckCircle2 aria-hidden="true" className={styles.activityIconDone} />;
    case "active":
      return <CircleDot aria-hidden="true" className={styles.activityIconActive} />;
    case "cancelled":
      return <Circle aria-hidden="true" className={styles.activityIconCancelled} />;
    default:
      return <Circle aria-hidden="true" className={styles.activityIconPending} />;
  }
}

function ParticipantStat({
  label,
  value,
  unit,
}: {
  label: string;
  value: number | null;
  unit?: string;
}) {
  return (
    <div className={styles.participantStat}>
      <span className={styles.participantValue}>
        {value != null ? value.toLocaleString() : "—"}
        {unit && value != null && (
          <span className={styles.participantUnit}> {unit}</span>
        )}
      </span>
      <span className={styles.participantLabel}>{label}</span>
    </div>
  );
}

export function CampaignCard({
  campaign,
  loading = false,
  error,
  children,
  className,
}: CampaignCardProps) {
  if (loading) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <div className={styles.loadingState}>
          <Spinner size="md" label="Loading campaign" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <Alert
          variant="error"
          title="Unable to load campaign"
          description={error}
        />
      </Card>
    );
  }

  if (!campaign) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <EmptyState
          icon={<Target aria-hidden="true" />}
          title="No campaign"
          description="Campaign details will appear here once configured."
        />
      </Card>
    );
  }

  const start = formatDate(campaign.startDate);
  const end = formatDate(campaign.endDate);
  const hasParticipants = Boolean(campaign.participants);

  return (
    <Card className={clsx(styles.card, className)} padded>
      <Card.Header className={styles.header}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>{campaign.label}</h3>
          <Badge variant={STATUS_VARIANT[campaign.status]} size="sm" dot>
            {STATUS_LABEL[campaign.status]}
          </Badge>
        </div>
        {campaign.description && (
          <p className={styles.description}>{campaign.description}</p>
        )}
      </Card.Header>

      <Card.Body className={styles.body}>
        <div className={styles.metaGrid}>
          {(start || end) && (
            <div className={styles.metaItem}>
              <CalendarDays aria-hidden="true" className={styles.metaIcon} />
              <div className={styles.metaContent}>
                <span className={styles.metaLabel}>Duration</span>
                <span className={styles.metaValue}>
                  {start && end
                    ? `${start} – ${end}`
                    : start
                      ? `From ${start}`
                      : `Until ${end}`}
                </span>
              </div>
            </div>
          )}
          {hasParticipants && (
            <div className={styles.metaItem}>
              <Users aria-hidden="true" className={styles.metaIcon} />
              <div className={styles.metaContent}>
                <span className={styles.metaLabel}>Participants</span>
                <span className={styles.metaValue}>
                  {campaign.participants!.enrolled != null
                    ? campaign.participants!.enrolled.toLocaleString()
                    : "—"}
                </span>
              </div>
            </div>
          )}
        </div>

        {hasParticipants && (
          <div className={styles.participantStats}>
            <ParticipantStat
              label="Enrolled"
              value={campaign.participants!.enrolled}
              unit={campaign.participants!.unit}
            />
            <ParticipantStat
              label="Active"
              value={campaign.participants!.active}
              unit={campaign.participants!.unit}
            />
            <ParticipantStat
              label="Completed"
              value={campaign.participants!.completed}
              unit={campaign.participants!.unit}
            />
          </div>
        )}

        {campaign.objectives.length > 0 && (
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Objectives</h4>
            <ul className={styles.objectiveList}>
              {campaign.objectives.map((obj) => (
                <li key={obj.id} className={styles.objectiveItem}>
                  <Target aria-hidden="true" className={styles.objectiveIcon} />
                  <div className={styles.objectiveContent}>
                    <span className={styles.objectiveLabel}>{obj.label}</span>
                    {obj.description && (
                      <span className={styles.objectiveDescription}>
                        {obj.description}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {campaign.audiences.length > 0 && (
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Audience</h4>
            <div className={styles.audienceChips}>
              {campaign.audiences.map((aud) => (
                <Badge key={aud.id} variant="info" size="sm">
                  {aud.label}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {campaign.activities.length > 0 && (
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>
              <ListChecks aria-hidden="true" className={styles.sectionIcon} />
              Activities
            </h4>
            <ul className={styles.activityList}>
              {campaign.activities.map((activity: CampaignActivity) => (
                <li key={activity.id} className={styles.activityItem}>
                  <ActivityIcon status={activity.status} />
                  <div className={styles.activityContent}>
                    <span className={styles.activityLabel}>
                      {activity.label}
                    </span>
                    {activity.description && (
                      <span className={styles.activityDescription}>
                        {activity.description}
                      </span>
                    )}
                    {activity.date && (
                      <span className={styles.activityDate}>
                        {formatDate(activity.date)}
                      </span>
                    )}
                  </div>
                  {activity.status && (
                    <Badge
                      variant={STATUS_VARIANT[activity.status]}
                      size="sm"
                    >
                      {STATUS_LABEL[activity.status]}
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {children}
      </Card.Body>
    </Card>
  );
}
