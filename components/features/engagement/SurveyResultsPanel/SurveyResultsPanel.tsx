import type { ReactNode } from "react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { BarChart3 } from "lucide-react";
import type {
  Survey,
  SurveyResponse,
  SurveyResults,
  DisabledState,
} from "@/components/features/engagement/models";
import styles from "./SurveyResultsPanel.module.scss";

export interface SurveyResultsPanelProps {
  /** The survey definition (provides question labels for aggregation). */
  survey?: Survey | null;
  /** Pre-computed results — rendered directly when supplied. */
  results?: SurveyResults | null;
  /** Raw responses — aggregated in a pure helper when `results` is absent. */
  responses?: SurveyResponse[];
  /** Loading state — shows a spinner. */
  loading?: boolean;
  /** Error message — shows an error alert. */
  error?: string;
  /** Empty state — shows placeholder. */
  empty?: boolean;
  /** Disabled state — dims the panel. */
  disabled?: DisabledState;
  /** Optional slot for extra content. */
  children?: ReactNode;
  className?: string;
}

interface PerQuestionAggregate {
  questionId: string;
  questionLabel: string;
  summary: string;
}

/**
 * Pure helper: aggregates raw `SurveyResponse[]` into per-question
 * summaries. Handles `string | string[]` response values safely.
 */
function aggregateResponses(
  survey: Survey,
  responses: SurveyResponse[],
): PerQuestionAggregate[] {
  return survey.questions.map((question) => {
    const answers: (string | string[])[] = responses
      .map((r) => r.responses[question.id])
      .filter((a): a is string | string[] => a != null);

    let summary: string;

    if (question.type === "text" || question.type === "rating") {
      const count = answers.length;
      summary = `${count} ${count === 1 ? "response" : "responses"}`;
    } else if (
      question.type === "single-choice" ||
      question.type === "boolean"
    ) {
      const tally = new Map<string, number>();
      for (const a of answers) {
        const key = Array.isArray(a) ? a.join(", ") : a;
        tally.set(key, (tally.get(key) ?? 0) + 1);
      }
      const entries = Array.from(tally.entries()).sort(
        (a, b) => b[1] - a[1],
      );
      summary =
        entries.length > 0
          ? entries
              .map(([value, count]) => `${value}: ${count}`)
              .join(" · ")
          : "No responses";
    } else if (question.type === "multi-choice") {
      const tally = new Map<string, number>();
      for (const a of answers) {
        const values = Array.isArray(a) ? a : [a];
        for (const v of values) {
          tally.set(v, (tally.get(v) ?? 0) + 1);
        }
      }
      const entries = Array.from(tally.entries()).sort(
        (a, b) => b[1] - a[1],
      );
      summary =
        entries.length > 0
          ? entries.map(([value, count]) => `${value}: ${count}`).join(" · ")
          : "No responses";
    } else {
      // scale
      const numericValues: number[] = [];
      for (const a of answers) {
        const aStr = Array.isArray(a) ? a.join(", ") : a;
        const parsed = parseInt(aStr, 10);
        if (!Number.isNaN(parsed)) numericValues.push(parsed);
      }
      if (numericValues.length === 0) {
        summary = "No responses";
      } else {
        const sum = numericValues.reduce((acc, n) => acc + n, 0);
        const avg = (sum / numericValues.length).toFixed(1);
        const min = Math.min(...numericValues);
        const max = Math.max(...numericValues);
        summary = `Avg: ${avg} · Min: ${min} · Max: ${max} (${numericValues.length} responses)`;
      }
    }

    return {
      questionId: question.id,
      questionLabel: question.question,
      summary,
    };
  });
}

export function SurveyResultsPanel({
  survey,
  results,
  responses,
  loading = false,
  error,
  empty = false,
  disabled,
  children,
  className,
}: SurveyResultsPanelProps) {
  if (loading) {
    return (
      <Card padded className={clsx(styles.loading, className)}>
        <Spinner size="md" label="Loading survey results" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card padded className={className}>
        <Alert
          variant="error"
          title="Results unavailable"
          description={error}
        />
      </Card>
    );
  }

  const isDisabled = Boolean(disabled?.disabled);

  // Determine the data source: pre-computed results take priority.
  const hasResults = results != null;
  const hasResponses = responses != null && responses.length > 0;
  const canAggregate = survey != null && hasResponses;

  if (empty || (!hasResults && !canAggregate)) {
    return (
      <Card padded className={clsx(styles.empty, className)}>
        <EmptyState
          icon={<BarChart3 aria-hidden="true" />}
          title="No results"
          description="There are no survey responses to display yet."
        />
      </Card>
    );
  }

  // Compute per-question aggregates.
  const responseCount = hasResults
    ? results!.responseCount
    : responses!.length;

  const perQuestion: PerQuestionAggregate[] = hasResults
    ? (results!.perQuestion ?? [])
    : canAggregate
      ? aggregateResponses(survey!, responses!)
      : [];

  const overallSummary = hasResults ? results!.overallSummary : undefined;

  return (
    <Card
      padded={false}
      className={clsx(
        styles.panel,
        isDisabled && styles.disabled,
        className,
      )}
      aria-disabled={isDisabled || undefined}
    >
      <div className={styles.body}>
        <div className={styles.header}>
          <span className={styles.headerIcon}>
            <BarChart3 aria-hidden="true" />
          </span>
          <div className={styles.headerInfo}>
            <h3 className={styles.title}>
              {survey?.title ?? "Survey results"}
            </h3>
            {survey?.description && (
              <p className={styles.description}>{survey.description}</p>
            )}
          </div>
          <Badge variant="primary" size="sm">
            {responseCount} {responseCount === 1 ? "response" : "responses"}
          </Badge>
        </div>

        {isDisabled && disabled?.disabledReason && (
          <p className={styles.disabledReason}>{disabled.disabledReason}</p>
        )}

        {overallSummary && (
          <div className={styles.overallSummary}>
            <p className={styles.overallText}>{overallSummary}</p>
          </div>
        )}

        {perQuestion.length > 0 && (
          <div className={styles.questions}>
            {perQuestion.map((pq, idx) => (
              <div key={pq.questionId} className={styles.questionResult}>
                <div className={styles.questionHeader}>
                  <span className={styles.questionIndex}>{idx + 1}</span>
                  <p className={styles.questionLabel}>{pq.questionLabel}</p>
                </div>
                <p className={styles.questionSummary}>{pq.summary}</p>
              </div>
            ))}
          </div>
        )}

        {children && <div className={styles.extra}>{children}</div>}
      </div>

      {survey?.questions.length && responseCount > 0 ? (
        <div className={styles.footer}>
          <Progress
            value={responseCount > 0 ? 100 : 0}
            size="sm"
            label="Response collection"
            valueText={`${responseCount} responses collected`}
          />
        </div>
      ) : null}
    </Card>
  );
}