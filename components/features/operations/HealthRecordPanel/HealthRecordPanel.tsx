import { format, isValid } from "date-fns";
import { HeartPulse } from "lucide-react";
import clsx from "clsx";
import { RestrictedRecordView } from "@/components/features/safeguarding/RestrictedRecordView";
import { RecordDetailPanel } from "@/components/shared/RecordDetailPanel";
import type { HealthRecord } from "@/components/features/operations/types";
import styles from "./HealthRecordPanel.module.scss";

export interface HealthRecordPanelProps {
  record?: HealthRecord | null;
  hasAccess: boolean;
  restrictedMessage?: string;
  restrictedTitle?: string;
  className?: string;
}

function formatDate(d: Date | string | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return isValid(date) ? format(date, "MMM d, yyyy") : "—";
}

export function HealthRecordPanel({
  record,
  hasAccess,
  restrictedMessage,
  restrictedTitle,
  className,
}: HealthRecordPanelProps) {
  return (
    <RestrictedRecordView
      hasAccess={hasAccess}
      restrictedMessage={restrictedMessage}
      restrictedTitle={restrictedTitle}
      className={clsx(styles.restrictedWrapper, className)}
    >
      {record && (
        <RecordDetailPanel
          inline
          open={false}
          onClose={() => {}}
          title={
            <span className={styles.titleRow}>
              <HeartPulse className={styles.titleIcon} aria-hidden="true" />
              Health record
            </span>
          }
          description={record.learnerName ?? undefined}
          fields={[
            { label: "Visit date", value: formatDate(record.visitDate) },
            { label: "Visit type", value: record.visitType },
            { label: "Provider", value: record.provider ?? "—" },
            { label: "Follow-up date", value: formatDate(record.followUpDate) },
          ]}
          sections={
            record.notes
              ? [
                  {
                    title: "Notes",
                    fields: [{ label: "Clinical notes", value: record.notes }],
                  },
                ]
              : undefined
          }
        />
      )}
    </RestrictedRecordView>
  );
}
