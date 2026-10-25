import type { ReactNode } from "react";
import { format } from "date-fns";
import { Sparkles } from "lucide-react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import type {
  StrengthCategory,
  StrengthEntry,
} from "@/components/features/careers/types";
import styles from "./StrengthsProfile.module.scss";

export interface StrengthsProfileProps {
  /** Configurable strength categories used in this profile. */
  categories: StrengthCategory[];
  /** Demonstrated strength entries. */
  strengths: StrengthEntry[];
  /** Optional title for the profile card. */
  title?: string;
  /** Optional description shown under the title. */
  description?: string;
  /** Optional free-text summary of the strengths profile. */
  summary?: string;
  loading?: boolean;
  error?: string;
  /** Force-empty state regardless of categories. */
  empty?: boolean;
  /** Optional content rendered below the profile (e.g. notes). */
  children?: ReactNode;
  className?: string;
}

function toDate(d: Date | string): Date {
  return typeof d === "string" ? new Date(d) : d;
}

function categoryLabel(
  categories: StrengthCategory[],
  key: string,
): string {
  return categories.find((c) => c.key === key)?.label ?? key;
}

export function StrengthsProfile({
  categories,
  strengths,
  title = "Demonstrated strengths",
  description,
  summary,
  loading = false,
  error,
  empty = false,
  children,
  className,
}: StrengthsProfileProps) {
  if (loading) {
    return (
      <Card className={clsx(styles.card, styles.loadingCard, className)} padded>
        <div className={styles.loadingBody}>
          <Spinner size="md" label="Loading strengths profile" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <Alert
          variant="error"
          title="Unable to load strengths profile"
          description={error}
        />
      </Card>
    );
  }

  const isEmpty = empty || (categories.length === 0 && strengths.length === 0);

  if (isEmpty) {
    return (
      <Card className={clsx(styles.card, className)} padded>
        <EmptyState
          icon={<Sparkles aria-hidden="true" />}
          title="No strengths recorded"
          description="Demonstrated strength categories and entries will appear here once recorded."
        />
      </Card>
    );
  }

  const grouped = categories.map((category) => ({
    category,
    entries: strengths.filter((s) => s.categoryKey === category.key),
  }));
  const ungrouped = strengths.filter(
    (s) => !categories.some((c) => c.key === s.categoryKey),
  );

  return (
    <Card className={clsx(styles.card, className)} padded>
      <Card.Header className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {description && (
          <p className={styles.description}>{description}</p>
        )}
      </Card.Header>

      <Card.Body className={styles.body}>
        {summary && <p className={styles.summary}>{summary}</p>}

        {grouped.length > 0 && (
          <div className={styles.groups}>
            {grouped.map(({ category, entries }) => (
              <section
                key={category.key}
                className={styles.group}
                aria-label={category.label}
              >
                <div className={styles.groupHead}>
                  <h4 className={styles.groupTitle}>{category.label}</h4>
                  <Badge variant="neutral" size="sm">
                    {entries.length}
                  </Badge>
                </div>
                {category.description && (
                  <p className={styles.groupDescription}>
                    {category.description}
                  </p>
                )}
                {entries.length > 0 ? (
                  <ul className={styles.entryList}>
                    {entries.map((entry) => (
                      <li key={entry.id} className={styles.entry}>
                        <p className={styles.entryDescription}>
                          {entry.description}
                        </p>
                        <div className={styles.entryMeta}>
                          {entry.evidenceLabel && (
                            <span className={styles.entryEvidence}>
                              Evidence: {entry.evidenceLabel}
                            </span>
                          )}
                          {entry.recordedAt && (
                            <span className={styles.entryDate}>
                              {format(toDate(entry.recordedAt), "MMM d, yyyy")}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.emptyCategory}>
                    No strengths recorded in this category yet.
                  </p>
                )}
              </section>
            ))}
          </div>
        )}

        {ungrouped.length > 0 && (
          <section className={styles.group} aria-label="Other strengths">
            <div className={styles.groupHead}>
              <h4 className={styles.groupTitle}>Other strengths</h4>
              <Badge variant="neutral" size="sm">
                {ungrouped.length}
              </Badge>
            </div>
            <ul className={styles.entryList}>
              {ungrouped.map((entry) => (
                <li key={entry.id} className={styles.entry}>
                  <p className={styles.entryDescription}>
                    {entry.description}
                  </p>
                  <div className={styles.entryMeta}>
                    <span className={styles.entryEvidence}>
                      Category: {categoryLabel(categories, entry.categoryKey)}
                    </span>
                    {entry.recordedAt && (
                      <span className={styles.entryDate}>
                        {format(toDate(entry.recordedAt), "MMM d, yyyy")}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {children}
      </Card.Body>
    </Card>
  );
}
