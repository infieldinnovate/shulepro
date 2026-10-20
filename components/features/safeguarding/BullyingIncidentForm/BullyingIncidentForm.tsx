"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import clsx from "clsx";
import { Input } from "../../../ui/Input";
import { Textarea } from "../../../ui/Textarea";
import { Select } from "../../../ui/Select";
import type { SelectOption } from "../../../ui/Select";
import { Checkbox } from "../../../ui/Checkbox";
import { DatePicker } from "../../../ui/DatePicker";
import { FormField } from "../../../ui/FormField";
import { Button } from "../../../ui/Button";
import { Spinner } from "../../../ui/Spinner";
import { Alert } from "../../../ui/Alert";
import { FormSection } from "../../../shared/FormSection";
import { FormActions } from "../../../shared/FormActions";
import { FormErrorSummary } from "../../../shared/FormErrorSummary";
import type { FormErrorEntry } from "../../../shared/FormErrorSummary";
import styles from "./BullyingIncidentForm.module.scss";

export interface BullyingIncidentFormOptions {
  typeOptions: SelectOption[];
}

export interface BullyingIncidentFormData {
  incidentDate: string;
  location: string;
  type: string;
  description: string;
  partiesInvolved: string;
  reporter: string;
  actionsTaken: string;
  followUpRequired: boolean;
}

export interface BullyingIncidentFormProps {
  options: BullyingIncidentFormOptions;
  onSubmit: (data: BullyingIncidentFormData) => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  error?: ReactNode;
  className?: string;
}

const schema = z.object({
  incidentDate: z.string().min(1, "Incident date is required"),
  location: z.string().max(200, "Location must be 200 characters or fewer"),
  type: z.string().min(1, "Please select an incident type"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(2000, "Description must be 2000 characters or fewer"),
  partiesInvolved: z
    .string()
    .max(1000, "Parties involved must be 1000 characters or fewer"),
  reporter: z
    .string()
    .min(1, "Reporter name is required")
    .max(200, "Reporter must be 200 characters or fewer"),
  actionsTaken: z
    .string()
    .max(2000, "Actions taken must be 2000 characters or fewer"),
  followUpRequired: z.boolean(),
});

export function BullyingIncidentForm({
  options,
  onSubmit,
  onCancel,
  loading = false,
  error,
  className,
}: BullyingIncidentFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<BullyingIncidentFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      incidentDate: new Date().toISOString().split("T")[0],
      location: "",
      type: "",
      description: "",
      partiesInvolved: "",
      reporter: "",
      actionsTaken: "",
      followUpRequired: false,
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

  const handleValidSubmit = (data: BullyingIncidentFormData) => {
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
          <Spinner size="md" label="Loading incident form" />
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(styles.container, className)}>
      {(error || submitError) && (
        <Alert
          variant="error"
          title="Unable to save incident"
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
          title="Incident details"
          description="Record the details of the incident using neutral, factual language."
        >
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
            label="Incident type"
            required
            errorText={errors.type?.message as string | undefined}
            invalid={!!errors.type}
          >
            <Select
              id="type"
              options={options.typeOptions}
              placeholder="Select type"
              {...register("type")}
              invalid={!!errors.type}
            />
          </FormField>

          <FormField
            label="Location"
            helperText="Where the incident occurred."
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
            label="Description"
            required
            helperText="Factual, neutral description of the incident."
            errorText={errors.description?.message as string | undefined}
            invalid={!!errors.description}
          >
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Describe the incident..."
              rows={4}
              invalid={!!errors.description}
            />
          </FormField>

          <FormField
            label="Parties involved"
            helperText="Optional. Names or roles of those involved."
            errorText={errors.partiesInvolved?.message as string | undefined}
            invalid={!!errors.partiesInvolved}
          >
            <Textarea
              id="partiesInvolved"
              {...register("partiesInvolved")}
              placeholder="List parties involved..."
              rows={2}
              invalid={!!errors.partiesInvolved}
            />
          </FormField>
        </FormSection>

        <FormSection
          title="Reporter and actions"
          description="Who reported the incident and what actions were taken."
        >
          <FormField
            label="Reporter"
            required
            errorText={errors.reporter?.message as string | undefined}
            invalid={!!errors.reporter}
          >
            <Input
              id="reporter"
              placeholder="Enter name"
              {...register("reporter")}
              invalid={!!errors.reporter}
            />
          </FormField>

          <FormField
            label="Actions taken"
            helperText="What actions were taken in response."
            errorText={errors.actionsTaken?.message as string | undefined}
            invalid={!!errors.actionsTaken}
          >
            <Textarea
              id="actionsTaken"
              {...register("actionsTaken")}
              placeholder="Describe actions taken..."
              rows={3}
              invalid={!!errors.actionsTaken}
            />
          </FormField>

          <Checkbox
            id="followUpRequired"
            label="Follow-up is required"
            {...register("followUpRequired")}
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
              Record incident
            </Button>
          }
        />
      </form>
    </div>
  );
}
