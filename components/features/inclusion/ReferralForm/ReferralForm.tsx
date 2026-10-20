"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import clsx from "clsx";
import { Input } from "../../../ui/Input";
import { Textarea } from "../../../ui/Textarea";
import { Select } from "../../../ui/Select";
import type { SelectOption } from "../../../ui/Select";
import { Checkbox } from "../../../ui/Checkbox";
import { FormField } from "../../../ui/FormField";
import { Button } from "../../../ui/Button";
import { Spinner } from "../../../ui/Spinner";
import { Alert } from "../../../ui/Alert";
import { FormSection } from "../../../shared/FormSection";
import { FormActions } from "../../../shared/FormActions";
import { FormErrorSummary } from "../../../shared/FormErrorSummary";
import type { FormErrorEntry } from "../../../shared/FormErrorSummary";
import type { Referral } from "../types";
import styles from "./ReferralForm.module.scss";

// ============================================================
// Configurable options — no hardcoded referral categories
// or urgency levels. All provided by the caller.
// ============================================================

export interface ReferralFormOptions {
  categoryOptions: SelectOption[];
  urgencyOptions: SelectOption[];
  /** Optional pre-set "referred to" options for a select. */
  recipientOptions?: SelectOption[];
  /** Optional pre-set referring staff options. */
  staffOptions?: SelectOption[];
}

export interface ReferralFormData {
  reason: string;
  category: string;
  urgency: string;
  recipient: string;
  referringStaff: string;
  supportingNotes?: string;
  consentAcknowledged: boolean;
}

export interface ReferralFormProps {
  options: ReferralFormOptions;
  /** Called with the referral data on submit. Does NOT contact anyone or auto-submit. */
  onSubmit: (data: ReferralFormData) => void | Promise<void>;
  onCancel?: () => void;
  /** Pre-fill the form for editing. */
  initialReferral?: Partial<Referral>;
  loading?: boolean;
  error?: ReactNode;
  className?: string;
}

const referralSchema = z.object({
  reason: z
    .string()
    .min(1, "Reason for referral is required")
    .max(2000, "Reason must be 2000 characters or fewer"),
  category: z.string().min(1, "Please select a referral category"),
  urgency: z.string().min(1, "Please select an urgency level"),
  recipient: z
    .string()
    .min(1, "Referred-to recipient is required")
    .max(200, "Recipient must be 200 characters or fewer"),
  referringStaff: z
    .string()
    .min(1, "Referring staff member is required")
    .max(200, "Staff name must be 200 characters or fewer"),
  supportingNotes: z
    .string()
    .max(2000, "Supporting notes must be 2000 characters or fewer")
    .optional()
    .or(z.literal("")),
  consentAcknowledged: z.boolean().refine((v) => v === true, {
    message: "Consent acknowledgement is required before submitting",
  }),
});

export function ReferralForm({
  options,
  onSubmit,
  onCancel,
  initialReferral,
  loading = false,
  error,
  className,
}: ReferralFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReferralFormData>({
    resolver: zodResolver(referralSchema),
    defaultValues: {
      reason: initialReferral?.reason ?? "",
      category: initialReferral?.type ?? "",
      urgency: "",
      recipient: initialReferral?.recipient ?? "",
      referringStaff: initialReferral?.initiatedByName ?? "",
      supportingNotes: initialReferral?.notes ?? "",
      consentAcknowledged: false,
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

  const handleValidSubmit = (data: ReferralFormData) => {
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
          <Spinner size="md" label="Loading referral form" />
        </div>
      </div>
    );
  }

  const hasRecipientOptions =
    options.recipientOptions && options.recipientOptions.length > 0;
  const hasStaffOptions =
    options.staffOptions && options.staffOptions.length > 0;

  return (
    <div className={clsx(styles.container, className)}>
      {(error || submitError) && (
        <Alert
          variant="error"
          title="Unable to save referral"
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
          title="Referral details"
          description="Complete the details below. Submitting records the referral for follow-up — it does not automatically contact any external service."
        >
          <FormField
            label="Referral category"
            required
            errorText={errors.category?.message as string | undefined}
            invalid={!!errors.category}
          >
            <Select
              id="category"
              options={options.categoryOptions}
              placeholder="Select category"
              {...register("category")}
              invalid={!!errors.category}
            />
          </FormField>

          <FormField
            label="Urgency"
            required
            errorText={errors.urgency?.message as string | undefined}
            invalid={!!errors.urgency}
          >
            <Select
              id="urgency"
              options={options.urgencyOptions}
              placeholder="Select urgency"
              {...register("urgency")}
              invalid={!!errors.urgency}
            />
          </FormField>

          <FormField
            label="Referred to"
            required
            helperText="Service, provider, or institution being referred to."
            errorText={errors.recipient?.message as string | undefined}
            invalid={!!errors.recipient}
          >
            {hasRecipientOptions ? (
              <Select
                id="recipient"
                options={options.recipientOptions}
                placeholder="Select recipient"
                {...register("recipient")}
                invalid={!!errors.recipient}
              />
            ) : (
              <Input
                id="recipient"
                placeholder="Enter recipient"
                {...register("recipient")}
                invalid={!!errors.recipient}
              />
            )}
          </FormField>

          <FormField
            label="Referring staff"
            required
            errorText={errors.referringStaff?.message as string | undefined}
            invalid={!!errors.referringStaff}
          >
            {hasStaffOptions ? (
              <Select
                id="referringStaff"
                options={options.staffOptions}
                placeholder="Select staff member"
                {...register("referringStaff")}
                invalid={!!errors.referringStaff}
              />
            ) : (
              <Input
                id="referringStaff"
                placeholder="Enter staff name"
                {...register("referringStaff")}
                invalid={!!errors.referringStaff}
              />
            )}
          </FormField>

          <FormField
            label="Reason for referral"
            required
            helperText="Describe the reason for this referral in neutral, non-diagnostic terms."
            errorText={errors.reason?.message as string | undefined}
            invalid={!!errors.reason}
          >
            <Textarea
              id="reason"
              {...register("reason")}
              placeholder="Describe the reason for the referral..."
              rows={4}
              invalid={!!errors.reason}
            />
          </FormField>

          <FormField
            label="Supporting notes"
            helperText="Optional additional context (non-diagnostic)."
            errorText={errors.supportingNotes?.message as string | undefined}
            invalid={!!errors.supportingNotes}
          >
            <Textarea
              id="supportingNotes"
              {...register("supportingNotes")}
              placeholder="Additional context..."
              rows={3}
            />
          </FormField>
        </FormSection>

        <FormSection
          title="Consent"
          description="Confirm that appropriate consent has been obtained before recording this referral."
          variant="plain"
        >
          <Checkbox
            id="consentAcknowledged"
            label="I confirm that consent has been obtained for this referral"
            invalid={!!errors.consentAcknowledged}
            {...register("consentAcknowledged")}
          />
          {errors.consentAcknowledged && (
            <p className={styles.consentError} role="alert">
              {errors.consentAcknowledged.message as string}
            </p>
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
              Record referral
            </Button>
          }
        />
      </form>
    </div>
  );
}
