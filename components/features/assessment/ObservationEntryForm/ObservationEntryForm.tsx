"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import clsx from "clsx";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import type { SelectOption } from "@/components/ui/Select";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { FormSection } from "@/components/shared/FormSection";
import { FormActions } from "@/components/shared/FormActions";
import { FormErrorSummary } from "@/components/shared/FormErrorSummary";
import type { FormErrorEntry } from "@/components/shared/FormErrorSummary";
import type {
  AttainmentLevel,
  EvidenceStatus,
  ObservationEntry,
} from "@/components/features/assessment/types";
import styles from "./ObservationEntryForm.module.scss";

// ============================================================
// Types
// ============================================================

export interface ObservationFormData {
  observedAt: string;
  evidenceStatus: EvidenceStatus;
  levelKey: string;
  notes: string;
}

export interface ObservationEntryFormProps {
  learnerRef: string;
  activityRef: string;
  /** Configurable attainment levels — supplied, not hardcoded. */
  attainmentLevels: AttainmentLevel[];
  /** Called with the observation data on submit. Does NOT persist. */
  onSubmit: (data: ObservationEntry) => void | Promise<void>;
  onCancel?: () => void;
  /** Pre-fill the form for editing an existing entry. */
  initialEntry?: Partial<ObservationEntry>;
  loading?: boolean;
  error?: ReactNode;
  className?: string;
}

// ============================================================
// Evidence status options — configurable labels, not hardcoded
// CBC descriptors. "not-assessed" and "insufficient-evidence"
// are distinct from "not-yet-demonstrated".
// ============================================================

export const DEFAULT_EVIDENCE_STATUS_OPTIONS: SelectOption[] = [
  { value: "not-assessed", label: "Not assessed" },
  { value: "insufficient-evidence", label: "Insufficient evidence" },
  { value: "not-yet-demonstrated", label: "Not yet demonstrated" },
  { value: "partially-demonstrated", label: "Partially demonstrated" },
  { value: "demonstrated", label: "Demonstrated" },
];

// ============================================================
// Zod schema
// ============================================================

// ============================================================
// Helpers
// ============================================================

function toDateInputValue(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
}

function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

// ============================================================
// Component
// ============================================================

export function ObservationEntryForm({
  learnerRef,
  activityRef,
  attainmentLevels,
  onSubmit,
  onCancel,
  initialEntry,
  loading = false,
  error,
  className,
}: ObservationEntryFormProps) {
  const today = new Date().toISOString().split("T")[0];
  const sortedLevels = [...attainmentLevels].sort((a, b) => a.order - b.order);

  const levelOptions: SelectOption[] = [
    { value: "", label: "No level selected", disabled: true },
    ...sortedLevels.map((level) => ({
      value: level.key,
      label: level.label,
    })),
  ];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ObservationFormData>({
    defaultValues: {
      observedAt: initialEntry?.observedAt
        ? toDateInputValue(initialEntry.observedAt)
        : today,
      evidenceStatus: (initialEntry?.evidenceStatus ?? "") as EvidenceStatus,
      levelKey: initialEntry?.levelKey ?? "",
      notes: initialEntry?.notes ?? "",
    },
    mode: "onTouched",
  });

  const [submitError, setSubmitError] = useState<ReactNode>(null);

  const errorEntries: FormErrorEntry[] = Object.entries(errors).map(
    ([field, err]) => ({
      field,
      message: (err?.message as string) ?? "Invalid value",
    }),
  );

  const handleValidSubmit = (data: ObservationFormData) => {
    setSubmitError(null);
    const entry: ObservationEntry = {
      id: initialEntry?.id ?? generateId("observation"),
      learnerRef,
      activityRef,
      observedAt: data.observedAt,
      evidenceStatus: data.evidenceStatus as EvidenceStatus,
      levelKey: data.levelKey || undefined,
      notes: data.notes || undefined,
    };
    onSubmit(entry);
  };

  const handleFormSubmit = () => {
    handleSubmit(handleValidSubmit)();
  };

  if (loading) {
    return (
      <div className={clsx(styles.container, className)}>
        <div className={styles.loadingState}>
          <Spinner size="md" label="Loading observation form" />
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(styles.container, className)}>
      {(error || submitError) && (
        <Alert
          variant="error"
          title="Unable to save observation"
          description={error ?? submitError}
        />
      )}

      {errorEntries.length > 0 && (
        <FormErrorSummary
          errors={errorEntries}
          onFocusField={(fieldId) => {
            const el = document.getElementById(fieldId);
            el?.focus();
          }}
        />
      )}

      <FormSection
        title="Observation details"
        description="Record what you observed. 'Insufficient evidence' is distinct from 'not yet demonstrated' — choose carefully."
      >
        <FormField
          label="Observation date"
          required
          errorText={errors.observedAt?.message as string | undefined}
          invalid={!!errors.observedAt}
        >
          <Input
            id="observedAt"
            type="date"
            {...register("observedAt")}
            invalid={!!errors.observedAt}
          />
        </FormField>

        <FormField
          label="Evidence status"
          required
          helperText="Distinguishes missing evidence from demonstrated skills."
          errorText={errors.evidenceStatus?.message as string | undefined}
          invalid={!!errors.evidenceStatus}
        >
          <Select
            id="evidenceStatus"
            options={DEFAULT_EVIDENCE_STATUS_OPTIONS}
            placeholder="Select evidence status"
            {...register("evidenceStatus")}
            invalid={!!errors.evidenceStatus}
          />
        </FormField>

        <FormField
          label="Attainment level"
          helperText="Optional — select the level demonstrated, if applicable."
        >
          <Select
            id="levelKey"
            options={levelOptions}
            placeholder="No level selected"
            {...register("levelKey")}
          />
        </FormField>

        <FormField
          label="Notes"
          helperText="What was observed, context, and any relevant details."
        >
          <Textarea
            id="notes"
            {...register("notes")}
            placeholder="Describe the observation..."
            rows={4}
          />
        </FormField>
      </FormSection>

      <FormActions
        cancel={
          onCancel ? (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting || loading}
            >
              Cancel
            </Button>
          ) : undefined
        }
        submit={
          <Button
            type="button"
            onClick={handleFormSubmit}
            loading={isSubmitting || loading}
          >
            Save observation
          </Button>
        }
      />
    </div>
  );
}
