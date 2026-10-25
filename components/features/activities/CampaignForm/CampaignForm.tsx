"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Megaphone } from "lucide-react";
import clsx from "clsx";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import type { SelectOption } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { FormSection } from "@/components/shared/FormSection";
import { FormActions } from "@/components/shared/FormActions";
import { FormErrorSummary } from "@/components/shared/FormErrorSummary";
import type { FormErrorEntry } from "@/components/shared/FormErrorSummary";
import type {
  ProgrammeObjective,
  ProgrammeAudience,
  CampaignActivity,
  CampaignFormValues,
} from "@/components/features/activities/types";
import styles from "./CampaignForm.module.scss";

export interface CampaignFormProps {
  /** Configurable objective options. */
  objectives: ProgrammeObjective[];
  /** Configurable audience options. */
  audiences: ProgrammeAudience[];
  /** Configurable activity options. */
  activities: CampaignActivity[];
  /** Called with the campaign data on submit. Does NOT persist. */
  onSubmit: (values: CampaignFormValues) => void | Promise<void>;
  onCancel?: () => void;
  /** Optional title shown above the form. */
  title?: string;
  /** Optional description shown under the title. */
  description?: string;
  /** Pre-fill values for editing. */
  initialValues?: Partial<CampaignFormValues>;
  loading?: boolean;
  error?: ReactNode;
  className?: string;
}

const STATUS_OPTIONS: SelectOption[] = [
  { value: "planned", label: "Planned" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

function buildSchema() {
  return z.object({
    label: z.string().min(1, "Campaign name is required").max(200, "Name must be 200 characters or fewer"),
    description: z.string().max(2000, "Description must be 2000 characters or fewer"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    status: z.enum(["planned", "active", "paused", "completed", "cancelled"]),
    objectiveIds: z.array(z.string()).superRefine((value, ctx) => {
      if (value.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["objectiveIds"],
          message: "Select at least one objective",
        });
      }
    }),
    audienceIds: z.array(z.string()).superRefine((value, ctx) => {
      if (value.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["audienceIds"],
          message: "Select at least one audience",
        });
      }
    }),
    activityIds: z.array(z.string()),
    participantEnrolled: z.string().max(10, "Must be 10 characters or fewer"),
    participantActive: z.string().max(10, "Must be 10 characters or fewer"),
    participantCompleted: z.string().max(10, "Must be 10 characters or fewer"),
  });
}

export function CampaignForm({
  objectives,
  audiences,
  activities,
  onSubmit,
  onCancel,
  title = "Campaign",
  description,
  initialValues,
  loading = false,
  error,
  className,
}: CampaignFormProps) {
  const [submitError, setSubmitError] = useState<ReactNode>(null);

  const schema = buildSchema();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CampaignFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: initialValues?.label ?? "",
      description: initialValues?.description ?? "",
      startDate: initialValues?.startDate ?? "",
      endDate: initialValues?.endDate ?? "",
      status: initialValues?.status ?? "planned",
      objectiveIds: initialValues?.objectiveIds ?? [],
      audienceIds: initialValues?.audienceIds ?? [],
      activityIds: initialValues?.activityIds ?? [],
      participantEnrolled: initialValues?.participantEnrolled ?? "",
      participantActive: initialValues?.participantActive ?? "",
      participantCompleted: initialValues?.participantCompleted ?? "",
    },
    mode: "onTouched",
  });

  if (loading) {
    return (
      <div className={clsx(styles.container, className)}>
        <div className={styles.loadingState}>
          <Spinner size="md" label="Loading campaign form" />
        </div>
      </div>
    );
  }

  if (objectives.length === 0 && audiences.length === 0 && activities.length === 0) {
    return (
      <div className={clsx(styles.container, className)}>
        <EmptyState
          icon={<Megaphone aria-hidden="true" />}
          title="No campaign options"
          description="Objectives, audiences, and activities must be configured before this form can be used."
        />
      </div>
    );
  }

  const errorEntries: FormErrorEntry[] = [];

  if (errors.label) {
    errorEntries.push({ field: "label", fieldLabel: "Campaign name", message: errors.label.message as string });
  }
  if (errors.description) {
    errorEntries.push({ field: "description", fieldLabel: "Description", message: errors.description.message as string });
  }
  if (errors.startDate) {
    errorEntries.push({ field: "startDate", fieldLabel: "Start date", message: errors.startDate.message as string });
  }
  if (errors.endDate) {
    errorEntries.push({ field: "endDate", fieldLabel: "End date", message: errors.endDate.message as string });
  }
  if (errors.status) {
    errorEntries.push({ field: "status", fieldLabel: "Status", message: errors.status.message as string });
  }
  if (errors.objectiveIds) {
    errorEntries.push({ field: "objectiveIds", fieldLabel: "Objectives", message: errors.objectiveIds.message as string });
  }
  if (errors.audienceIds) {
    errorEntries.push({ field: "audienceIds", fieldLabel: "Audience", message: errors.audienceIds.message as string });
  }
  if (errors.participantEnrolled) {
    errorEntries.push({ field: "participantEnrolled", fieldLabel: "Enrolled", message: errors.participantEnrolled.message as string });
  }
  if (errors.participantActive) {
    errorEntries.push({ field: "participantActive", fieldLabel: "Active", message: errors.participantActive.message as string });
  }
  if (errors.participantCompleted) {
    errorEntries.push({ field: "participantCompleted", fieldLabel: "Completed", message: errors.participantCompleted.message as string });
  }

  const handleValidSubmit = (data: CampaignFormValues) => {
    setSubmitError(null);
    onSubmit(data);
  };

  const handleFormSubmit = () => {
    handleSubmit(handleValidSubmit)();
  };

  return (
    <div className={clsx(styles.container, className)}>
      {(error || submitError) && (
        <Alert
          variant="error"
          title="Unable to save campaign"
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

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          handleFormSubmit();
        }}
      >
        {(title || description) && (
          <div className={styles.formHeader}>
            {title && <h3 className={styles.formTitle}>{title}</h3>}
            {description && (
              <p className={styles.formDescription}>{description}</p>
            )}
          </div>
        )}

        <FormSection
          title="Campaign details"
          description="Basic information about this campaign."
        >
          <FormField
            label="Campaign name"
            required
            errorText={errors.label?.message as string | undefined}
            invalid={!!errors.label}
          >
            <Input
              id="label"
              placeholder="Enter campaign name"
              {...register("label")}
              invalid={!!errors.label}
            />
          </FormField>

          <FormField
            label="Description"
            helperText="Optional context about this campaign."
            errorText={errors.description?.message as string | undefined}
            invalid={!!errors.description}
          >
            <Textarea
              id="description"
              placeholder="Enter description..."
              rows={3}
              {...register("description")}
              invalid={!!errors.description}
            />
          </FormField>

          <div className={styles.detailGrid}>
            <FormField
              label="Start date"
              required
              errorText={errors.startDate?.message as string | undefined}
              invalid={!!errors.startDate}
            >
              <Input
                id="startDate"
                type="date"
                {...register("startDate")}
                invalid={!!errors.startDate}
              />
            </FormField>

            <FormField
              label="End date"
              required
              errorText={errors.endDate?.message as string | undefined}
              invalid={!!errors.endDate}
            >
              <Input
                id="endDate"
                type="date"
                {...register("endDate")}
                invalid={!!errors.endDate}
              />
            </FormField>

            <FormField
              label="Status"
              required
              errorText={errors.status?.message as string | undefined}
              invalid={!!errors.status}
            >
              <Select
                id="status"
                options={STATUS_OPTIONS}
                {...register("status")}
                invalid={!!errors.status}
              />
            </FormField>
          </div>
        </FormSection>

        <FormSection
          title="Objectives"
          description="Select the objectives this campaign addresses."
        >
          <Controller
            control={control}
            name="objectiveIds"
            render={({ field }) => (
              <div className={styles.checkboxGrid} role="group" aria-label="Objectives">
                {objectives.map((obj) => {
                  const checked = field.value?.includes(obj.id) ?? false;
                  return (
                    <Checkbox
                      key={obj.id}
                      id={`obj-${obj.id}`}
                      label={obj.label}
                      description={obj.description}
                      checked={checked}
                      invalid={!!errors.objectiveIds}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...(field.value ?? []), obj.id]
                          : (field.value ?? []).filter((v: string) => v !== obj.id);
                        field.onChange(next);
                      }}
                    />
                  );
                })}
              </div>
            )}
          />
          {errors.objectiveIds && (
            <p className={styles.fieldError} role="alert">
              {errors.objectiveIds.message as string}
            </p>
          )}
        </FormSection>

        <FormSection
          title="Audience"
          description="Select the target audiences for this campaign."
        >
          <Controller
            control={control}
            name="audienceIds"
            render={({ field }) => (
              <div className={styles.checkboxGrid} role="group" aria-label="Audience">
                {audiences.map((aud) => {
                  const checked = field.value?.includes(aud.id) ?? false;
                  return (
                    <Checkbox
                      key={aud.id}
                      id={`aud-${aud.id}`}
                      label={aud.label}
                      description={aud.description}
                      checked={checked}
                      invalid={!!errors.audienceIds}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...(field.value ?? []), aud.id]
                          : (field.value ?? []).filter((v: string) => v !== aud.id);
                        field.onChange(next);
                      }}
                    />
                  );
                })}
              </div>
            )}
          />
          {errors.audienceIds && (
            <p className={styles.fieldError} role="alert">
              {errors.audienceIds.message as string}
            </p>
          )}
        </FormSection>

        {activities.length > 0 && (
          <FormSection
            title="Activities"
            description="Select the activities included in this campaign."
          >
            <Controller
              control={control}
              name="activityIds"
              render={({ field }) => (
                <div className={styles.checkboxGrid} role="group" aria-label="Activities">
                  {activities.map((act) => {
                    const checked = field.value?.includes(act.id) ?? false;
                    return (
                      <Checkbox
                        key={act.id}
                        id={`act-${act.id}`}
                        label={act.label}
                        description={act.description}
                        checked={checked}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...(field.value ?? []), act.id]
                            : (field.value ?? []).filter((v: string) => v !== act.id);
                          field.onChange(next);
                        }}
                      />
                    );
                  })}
                </div>
              )}
            />
          </FormSection>
        )}

        <FormSection title="Participants" variant="plain">
          <div className={styles.detailGrid}>
            <FormField
              label="Enrolled"
              helperText="Number of participants enrolled."
              errorText={errors.participantEnrolled?.message as string | undefined}
              invalid={!!errors.participantEnrolled}
            >
              <Input
                id="participantEnrolled"
                type="number"
                placeholder="0"
                {...register("participantEnrolled")}
                invalid={!!errors.participantEnrolled}
              />
            </FormField>

            <FormField
              label="Active"
              helperText="Number of active participants."
              errorText={errors.participantActive?.message as string | undefined}
              invalid={!!errors.participantActive}
            >
              <Input
                id="participantActive"
                type="number"
                placeholder="0"
                {...register("participantActive")}
                invalid={!!errors.participantActive}
              />
            </FormField>

            <FormField
              label="Completed"
              helperText="Number of participants who completed."
              errorText={errors.participantCompleted?.message as string | undefined}
              invalid={!!errors.participantCompleted}
            >
              <Input
                id="participantCompleted"
                type="number"
                placeholder="0"
                {...register("participantCompleted")}
                invalid={!!errors.participantCompleted}
              />
            </FormField>
          </div>
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
              Save campaign
            </Button>
          }
        />
      </form>
    </div>
  );
}
