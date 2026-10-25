"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import clsx from "clsx";
import { Input } from "@/components/ui/Input";
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
import type { SchoolSettingsFormData } from "@/components/features/admin/types";
import styles from "./SchoolSettingsForm.module.scss";

export interface SchoolSettingsFormOptions {
  timezoneOptions: SelectOption[];
  languageOptions: SelectOption[];
  currencyOptions: SelectOption[];
}

export interface SchoolSettingsFormProps {
  options: SchoolSettingsFormOptions;
  defaultValues?: Partial<SchoolSettingsFormData>;
  onSubmit: (data: SchoolSettingsFormData) => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  error?: ReactNode;
  className?: string;
}

const schema = z.object({
  schoolName: z
    .string()
    .min(1, "School name is required")
    .max(200, "School name must be 200 characters or fewer"),
  address: z
    .string()
    .max(500, "Address must be 500 characters or fewer"),
  phone: z
    .string()
    .max(50, "Phone must be 50 characters or fewer"),
  email: z
    .string()
    .max(200, "Email must be 200 characters or fewer")
    .email("Enter a valid email address")
    .or(z.literal("")),
  logoUrl: z
    .string()
    .max(2000, "Logo URL must be 2000 characters or fewer")
    .url("Enter a valid URL")
    .or(z.literal("")),
  timezone: z.string().min(1, "Please select a timezone"),
  language: z.string().min(1, "Please select a language"),
  currency: z.string().min(1, "Please select a currency"),
});

export function SchoolSettingsForm({
  options,
  defaultValues,
  onSubmit,
  onCancel,
  loading = false,
  error,
  className,
}: SchoolSettingsFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SchoolSettingsFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      schoolName: "",
      address: "",
      phone: "",
      email: "",
      logoUrl: "",
      timezone: "",
      language: "",
      currency: "",
      ...defaultValues,
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

  const handleValidSubmit = (data: SchoolSettingsFormData) => {
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
          <Spinner size="md" label="Loading school settings" />
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(styles.container, className)}>
      {(error || submitError) && (
        <Alert
          variant="error"
          title="Unable to save settings"
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
          title="General settings"
          description="Configure your institution's general information and regional preferences."
        >
          <FormField
            label="Institution name"
            required
            errorText={errors.schoolName?.message as string | undefined}
            invalid={!!errors.schoolName}
          >
            <Input
              id="schoolName"
              placeholder="Enter institution name"
              {...register("schoolName")}
              invalid={!!errors.schoolName}
            />
          </FormField>

          <FormField
            label="Address"
            helperText="Optional. Postal or physical address."
            errorText={errors.address?.message as string | undefined}
            invalid={!!errors.address}
          >
            <Input
              id="address"
              placeholder="Enter address"
              {...register("address")}
              invalid={!!errors.address}
            />
          </FormField>

          <div className={styles.fieldGrid}>
            <FormField
              label="Phone"
              helperText="Optional. Main contact number."
              errorText={errors.phone?.message as string | undefined}
              invalid={!!errors.phone}
            >
              <Input
                id="phone"
                type="tel"
                placeholder="e.g. +1 555 000 0000"
                {...register("phone")}
                invalid={!!errors.phone}
              />
            </FormField>

            <FormField
              label="Email"
              helperText="Optional. Main contact email."
              errorText={errors.email?.message as string | undefined}
              invalid={!!errors.email}
            >
              <Input
                id="email"
                type="email"
                placeholder="info@institution.edu"
                {...register("email")}
                invalid={!!errors.email}
              />
            </FormField>
          </div>

          <FormField
            label="Logo URL"
            helperText="Optional. Link to the institution's logo image."
            errorText={errors.logoUrl?.message as string | undefined}
            invalid={!!errors.logoUrl}
          >
            <Input
              id="logoUrl"
              type="url"
              placeholder="https://example.com/logo.png"
              {...register("logoUrl")}
              invalid={!!errors.logoUrl}
            />
          </FormField>

          <div className={styles.fieldGrid}>
            <FormField
              label="Timezone"
              required
              errorText={errors.timezone?.message as string | undefined}
              invalid={!!errors.timezone}
            >
              <Select
                id="timezone"
                options={options.timezoneOptions}
                placeholder="Select timezone"
                {...register("timezone")}
                invalid={!!errors.timezone}
              />
            </FormField>

            <FormField
              label="Language"
              required
              helperText="Primary display language."
              errorText={errors.language?.message as string | undefined}
              invalid={!!errors.language}
            >
              <Select
                id="language"
                options={options.languageOptions}
                placeholder="Select language"
                {...register("language")}
                invalid={!!errors.language}
              />
            </FormField>
          </div>

          <FormField
            label="Currency"
            required
            helperText="Currency used for financial features."
            errorText={errors.currency?.message as string | undefined}
            invalid={!!errors.currency}
          >
            <Select
              id="currency"
              options={options.currencyOptions}
              placeholder="Select currency"
              {...register("currency")}
              invalid={!!errors.currency}
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
              leftIcon={<Save aria-hidden="true" />}
            >
              Save settings
            </Button>
          }
        />
      </form>
    </div>
  );
}
