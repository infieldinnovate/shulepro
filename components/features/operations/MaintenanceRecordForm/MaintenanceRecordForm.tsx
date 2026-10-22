"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Wrench } from "lucide-react";
import clsx from "clsx";
import { Combobox } from "../../../ui/Combobox";
import type { ComboboxOption } from "../../../ui/Combobox";
import { Select } from "../../../ui/Select";
import type { SelectOption } from "../../../ui/Select";
import { Input } from "../../../ui/Input";
import { Textarea } from "../../../ui/Textarea";
import { DatePicker } from "../../../ui/DatePicker";
import { FormField } from "../../../ui/FormField";
import { Button } from "../../../ui/Button";
import { Spinner } from "../../../ui/Spinner";
import { Alert } from "../../../ui/Alert";
import { FormSection } from "../../../shared/FormSection";
import { FormActions } from "../../../shared/FormActions";
import { FormErrorSummary } from "../../../shared/FormErrorSummary";
import type { FormErrorEntry } from "../../../shared/FormErrorSummary";
import styles from "./MaintenanceRecordForm.module.scss";

export interface MaintenanceRecordFormOptions {
  assetOptions: ComboboxOption[];
  maintenanceTypeOptions: SelectOption[];
}

export interface MaintenanceRecordFormData {
  assetRef: string;
  maintenanceType: string;
  date: string;
  cost: string;
  currency: string;
  provider: string;
  description: string;
  nextDueDate: string;
}

export interface MaintenanceRecordFormProps {
  options: MaintenanceRecordFormOptions;
  onSubmit: (data: MaintenanceRecordFormData) => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  error?: ReactNode;
  className?: string;
}

const schema = z.object({
  assetRef: z.string().min(1, "Please select an asset or vehicle"),
  maintenanceType: z.string().min(1, "Please select a maintenance type"),
  date: z.string().min(1, "Maintenance date is required"),
  cost: z.string().max(20, "Cost must be 20 characters or fewer"),
  currency: z.string().max(10, "Currency must be 10 characters or fewer"),
  provider: z.string().max(200, "Provider must be 200 characters or fewer"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(2000, "Description must be 2000 characters or fewer"),
  nextDueDate: z.string().max(10, "Invalid date"),
});

export function MaintenanceRecordForm({
  options,
  onSubmit,
  onCancel,
  loading = false,
  error,
  className,
}: MaintenanceRecordFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<MaintenanceRecordFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      assetRef: "",
      maintenanceType: "",
      date: new Date().toISOString().split("T")[0],
      cost: "",
      currency: "",
      provider: "",
      description: "",
      nextDueDate: "",
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

  const handleValidSubmit = (data: MaintenanceRecordFormData) => {
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
          <Spinner size="md" label="Loading maintenance form" />
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(styles.container, className)}>
      {(error || submitError) && (
        <Alert
          variant="error"
          title="Unable to save maintenance record"
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
          title="Maintenance details"
          description="Log a maintenance record for an asset or vehicle."
        >
          <FormField
            label="Asset / Vehicle"
            required
            errorText={errors.assetRef?.message as string | undefined}
            invalid={!!errors.assetRef}
          >
            <Controller
              control={control}
              name="assetRef"
              render={({ field }) => (
                <Combobox
                  id="assetRef"
                  options={options.assetOptions}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select asset or vehicle"
                  searchPlaceholder="Search..."
                  emptyText="No assets found"
                  invalid={!!errors.assetRef}
                  clearable
                />
              )}
            />
          </FormField>

          <FormField
            label="Maintenance type"
            required
            errorText={errors.maintenanceType?.message as string | undefined}
            invalid={!!errors.maintenanceType}
          >
            <Select
              id="maintenanceType"
              options={options.maintenanceTypeOptions}
              placeholder="Select type"
              {...register("maintenanceType")}
              invalid={!!errors.maintenanceType}
            />
          </FormField>

          <FormField
            label="Date"
            required
            errorText={errors.date?.message as string | undefined}
            invalid={!!errors.date}
          >
            <Controller
              control={control}
              name="date"
              render={({ field }) => (
                <DatePicker
                  id="date"
                  value={field.value ? new Date(field.value) : null}
                  onValueChange={(d) => {
                    field.onChange(d ? d.toISOString().split("T")[0] : "");
                  }}
                  invalid={!!errors.date}
                />
              )}
            />
          </FormField>

          <FormField
            label="Cost"
            helperText="Optional. Numeric value for the maintenance cost."
            errorText={errors.cost?.message as string | undefined}
            invalid={!!errors.cost}
          >
            <Input
              id="cost"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register("cost")}
              invalid={!!errors.cost}
            />
          </FormField>

          <FormField
            label="Currency"
            helperText="Optional. Currency code, e.g. USD, EUR."
            errorText={errors.currency?.message as string | undefined}
            invalid={!!errors.currency}
          >
            <Input
              id="currency"
              placeholder="e.g. USD"
              {...register("currency")}
              invalid={!!errors.currency}
            />
          </FormField>

          <FormField
            label="Provider / Vendor"
            helperText="Optional. Who performed the maintenance."
            errorText={errors.provider?.message as string | undefined}
            invalid={!!errors.provider}
          >
            <Input
              id="provider"
              placeholder="Enter provider or vendor name"
              {...register("provider")}
              invalid={!!errors.provider}
            />
          </FormField>

          <FormField
            label="Description"
            required
            helperText="What was done during maintenance."
            errorText={errors.description?.message as string | undefined}
            invalid={!!errors.description}
          >
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Describe the maintenance work..."
              rows={4}
              invalid={!!errors.description}
            />
          </FormField>

          <FormField
            label="Next due date"
            helperText="Optional. When the next maintenance is due."
            errorText={errors.nextDueDate?.message as string | undefined}
            invalid={!!errors.nextDueDate}
          >
            <Controller
              control={control}
              name="nextDueDate"
              render={({ field }) => (
                <DatePicker
                  id="nextDueDate"
                  value={field.value ? new Date(field.value) : null}
                  onValueChange={(d) => {
                    field.onChange(d ? d.toISOString().split("T")[0] : "");
                  }}
                  invalid={!!errors.nextDueDate}
                  clearable
                />
              )}
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
              leftIcon={<Wrench aria-hidden="true" />}
            >
              Save record
            </Button>
          }
        />
      </form>
    </div>
  );
}
