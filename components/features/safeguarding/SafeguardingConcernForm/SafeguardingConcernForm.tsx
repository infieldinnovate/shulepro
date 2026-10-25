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
import { Checkbox } from "@/components/ui/Checkbox";
import { DatePicker } from "@/components/ui/DatePicker";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { FormSection } from "@/components/shared/FormSection";
import { FormActions } from "@/components/shared/FormActions";
import { FormErrorSummary } from "@/components/shared/FormErrorSummary";
import type { FormErrorEntry } from "@/components/shared/FormErrorSummary";
import styles from "./SafeguardingConcernForm.module.scss";

export interface SafeguardingConcernFormOptions {
  categoryOptions: SelectOption[];
  urgencyOptions: SelectOption[];
}

export interface SafeguardingConcernFormData {
  category: string;
  urgency: string;
  summary: string;
  incidentDate: string;
  location: string;
  witnesses: string;
  consentToShare: boolean;
  reporterName: string;
  reporterRole: string;
}

export interface SafeguardingConcernFormProps {
  options: SafeguardingConcernFormOptions;
  onSubmit: (data: SafeguardingConcernFormData) => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  error?: ReactNode;
  className?: string;
}

const schema = z.object({
  category: z.string().min(1, "Please select a category"),
  urgency: z.string().min(1, "Please select an urgency level"),
  summary: z
    .string()
    .min(1, "Summary is required")
    .max(2000, "Summary must be 2000 characters or fewer"),
  incidentDate: z.string().min(1, "Incident date is required"),
  location: z
    .string()
    .max(200, "Location must be 200 characters or fewer"),
  witnesses: z
    .string()
    .max(1000, "Witnesses must be 1000 characters or fewer"),
  consentToShare: z.boolean(),
  reporterName: z
    .string()
    .min(1, "Reporter name is required")
    .max(200, "Name must be 200 characters or fewer"),
  reporterRole: z
    .string()
    .max(200, "Role must be 200 characters or fewer"),
});

export function SafeguardingConcernForm({
  options,
  onSubmit,
  onCancel,
  loading = false,
  error,
  className,
}: SafeguardingConcernFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SafeguardingConcernFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: "",
      urgency: "",
      summary: "",
      incidentDate: new Date().toISOString().split("T")[0],
      location: "",
      witnesses: "",
      consentToShare: false,
      reporterName: "",
      reporterRole: "",
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

  const handleValidSubmit = (data: SafeguardingConcernFormData) => {
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
          <Spinner size="md" label="Loading concern form" />
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(styles.container, className)}>
      <Alert
        variant="info"
        title="Recording a concern"
        description="Submitting this form records the concern for follow-up. Escalation and reporting to external authorities are handled by authorized personnel — this form does not contact any external service."
      />

      {(error || submitError) && (
        <Alert
          variant="error"
          title="Unable to save concern"
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
          title="Concern details"
          description="Provide a factual, neutral summary of the concern."
        >
          <FormField
            label="Category"
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
            label="Incident date"
            required
            errorText={errors.incidentDate?.message as string | undefined}
            invalid={!!errors.incidentDate}
          >
            <Controller
              control={control}
              name="incidentDate"
              render={({ field }) => (
                <DatePicker
                  id="incidentDate"
                  value={field.value ? new Date(field.value) : null}
                  onValueChange={(d) => {
                    field.onChange(d ? d.toISOString().split("T")[0] : "");
                  }}
                  invalid={!!errors.incidentDate}
                />
              )}
            />
          </FormField>

          <FormField
            label="Location"
            helperText="Where the concern was observed or reported."
            errorText={errors.location?.message as string | undefined}
            invalid={!!errors.location}
          >
            <Input
              id="location"
              placeholder="Enter location"
              {...register("location")}
              invalid={!!errors.location}
            />
          </FormField>

          <FormField
            label="Summary"
            required
            helperText="Factual, neutral description of the concern."
            errorText={errors.summary?.message as string | undefined}
            invalid={!!errors.summary}
          >
            <Textarea
              id="summary"
              {...register("summary")}
              placeholder="Describe the concern..."
              rows={4}
              invalid={!!errors.summary}
            />
          </FormField>

          <FormField
            label="Witnesses"
            helperText="Optional. Names or roles of any witnesses."
            errorText={errors.witnesses?.message as string | undefined}
            invalid={!!errors.witnesses}
          >
            <Textarea
              id="witnesses"
              {...register("witnesses")}
              placeholder="List witnesses..."
              rows={2}
              invalid={!!errors.witnesses}
            />
          </FormField>
        </FormSection>

        <FormSection
          title="Reporter"
          description="Who is reporting this concern."
        >
          <FormField
            label="Reporter name"
            required
            errorText={errors.reporterName?.message as string | undefined}
            invalid={!!errors.reporterName}
          >
            <Input
              id="reporterName"
              placeholder="Enter name"
              {...register("reporterName")}
              invalid={!!errors.reporterName}
            />
          </FormField>

          <FormField
            label="Reporter role"
            helperText="Role or position of the reporter."
            errorText={errors.reporterRole?.message as string | undefined}
            invalid={!!errors.reporterRole}
          >
            <Input
              id="reporterRole"
              placeholder="Enter role"
              {...register("reporterRole")}
              invalid={!!errors.reporterRole}
            />
          </FormField>
        </FormSection>

        <FormSection title="Consent" variant="plain">
          <Checkbox
            id="consentToShare"
            label="Consent has been given to share this information with authorized personnel"
            {...register("consentToShare")}
          />
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
              Record concern
            </Button>
          }
        />
      </form>
    </div>
  );
}
