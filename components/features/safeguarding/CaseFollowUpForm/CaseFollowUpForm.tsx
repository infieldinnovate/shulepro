"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import clsx from "clsx";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import type { SelectOption } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { FormSection } from "@/components/shared/FormSection";
import { FormActions } from "@/components/shared/FormActions";
import { FormErrorSummary } from "@/components/shared/FormErrorSummary";
import type { FormErrorEntry } from "@/components/shared/FormErrorSummary";
import styles from "./CaseFollowUpForm.module.scss";

export interface CaseFollowUpFormOptions {
  /** Optional status update options for the select. */
  statusOptions?: SelectOption[];
}

export interface CaseFollowUpFormData {
  followUpDate: string;
  actionTaken: string;
  outcome: string;
  followedUpBy: string;
  nextStep: string;
  statusUpdate: string;
}

export interface CaseFollowUpFormProps {
  options?: CaseFollowUpFormOptions;
  onSubmit: (data: CaseFollowUpFormData) => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  error?: ReactNode;
  className?: string;
}

const schema = z.object({
  followUpDate: z.string().min(1, "Follow-up date is required"),
  actionTaken: z
    .string()
    .min(1, "Action taken is required")
    .max(2000, "Action taken must be 2000 characters or fewer"),
  outcome: z
    .string()
    .min(1, "Outcome is required")
    .max(2000, "Outcome must be 2000 characters or fewer"),
  followedUpBy: z
    .string()
    .min(1, "Follow-up by is required")
    .max(200, "Name must be 200 characters or fewer"),
  nextStep: z
    .string()
    .max(2000, "Next step must be 2000 characters or fewer"),
  statusUpdate: z.string().max(100, "Status must be 100 characters or fewer"),
});

export function CaseFollowUpForm({
  options,
  onSubmit,
  onCancel,
  loading = false,
  error,
  className,
}: CaseFollowUpFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CaseFollowUpFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      followUpDate: new Date().toISOString().split("T")[0],
      actionTaken: "",
      outcome: "",
      followedUpBy: "",
      nextStep: "",
      statusUpdate: "",
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

  const handleValidSubmit = (data: CaseFollowUpFormData) => {
    setSubmitError(null);
    onSubmit(data);
  };

  const handleFormSubmit = () => {
    handleSubmit(handleValidSubmit)();
  };

  if (loading) {
    return (
      <div className={clsx(styles.container, className)}>
        <div className={styles.loadingState}>
          <Spinner size="md" label="Loading follow-up form" />
        </div>
      </div>
    );
  }

  const hasStatusOptions =
    options?.statusOptions && options.statusOptions.length > 0;

  return (
    <div className={clsx(styles.container, className)}>
      {(error || submitError) && (
        <Alert
          variant="error"
          title="Unable to save follow-up"
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
        <FormSection
          title="Follow-up details"
          description="Record the follow-up action and outcome for this case."
        >
          <FormField
            label="Follow-up date"
            required
            errorText={errors.followUpDate?.message as string | undefined}
            invalid={!!errors.followUpDate}
          >
            <Controller
              control={control}
              name="followUpDate"
              render={({ field }) => (
                <DatePicker
                  id="followUpDate"
                  value={field.value ? new Date(field.value) : null}
                  onValueChange={(d) => {
                    field.onChange(d ? d.toISOString().split("T")[0] : "");
                  }}
                  invalid={!!errors.followUpDate}
                />
              )}
            />
          </FormField>

          <FormField
            label="Follow-up by"
            required
            helperText="Person conducting the follow-up."
            errorText={errors.followedUpBy?.message as string | undefined}
            invalid={!!errors.followedUpBy}
          >
            <Input
              id="followedUpBy"
              placeholder="Enter name"
              {...register("followedUpBy")}
              invalid={!!errors.followedUpBy}
            />
          </FormField>

          <FormField
            label="Action taken"
            required
            errorText={errors.actionTaken?.message as string | undefined}
            invalid={!!errors.actionTaken}
          >
            <Textarea
              id="actionTaken"
              {...register("actionTaken")}
              placeholder="Describe the action taken..."
              rows={3}
              invalid={!!errors.actionTaken}
            />
          </FormField>

          <FormField
            label="Outcome"
            required
            errorText={errors.outcome?.message as string | undefined}
            invalid={!!errors.outcome}
          >
            <Textarea
              id="outcome"
              {...register("outcome")}
              placeholder="Describe the outcome..."
              rows={3}
              invalid={!!errors.outcome}
            />
          </FormField>

          <FormField
            label="Next step"
            helperText="Optional. What should happen next."
            errorText={errors.nextStep?.message as string | undefined}
            invalid={!!errors.nextStep}
          >
            <Textarea
              id="nextStep"
              {...register("nextStep")}
              placeholder="Describe next steps..."
              rows={2}
              invalid={!!errors.nextStep}
            />
          </FormField>

          {hasStatusOptions && (
            <FormField
              label="Case status update"
              helperText="Optional. Update the case status."
              errorText={errors.statusUpdate?.message as string | undefined}
              invalid={!!errors.statusUpdate}
            >
              <Select
                id="statusUpdate"
                options={options!.statusOptions!}
                placeholder="No change"
                {...register("statusUpdate")}
                invalid={!!errors.statusUpdate}
              />
            </FormField>
          )}
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
              leftIcon={<Send aria-hidden="true" />}
            >
              Save follow-up
            </Button>
          }
        />
      </form>
    </div>
  );
}
