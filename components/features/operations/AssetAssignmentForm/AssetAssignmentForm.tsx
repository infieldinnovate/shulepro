"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightLeft } from "lucide-react";
import clsx from "clsx";
import { Combobox } from "@/components/ui/Combobox";
import type { ComboboxOption } from "@/components/ui/Combobox";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { DatePicker } from "@/components/ui/DatePicker";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { FormSection } from "@/components/shared/FormSection";
import { FormActions } from "@/components/shared/FormActions";
import { FormErrorSummary } from "@/components/shared/FormErrorSummary";
import type { FormErrorEntry } from "@/components/shared/FormErrorSummary";
import styles from "./AssetAssignmentForm.module.scss";

export interface AssetAssignmentFormOptions {
  assetOptions: ComboboxOption[];
  assigneeOptions: ComboboxOption[];
}

export interface AssetAssignmentFormData {
  assetRef: string;
  assigneeRef: string;
  assigneeName: string;
  assignmentDate: string;
  expectedReturnDate: string;
  notes: string;
}

export interface AssetAssignmentFormProps {
  options: AssetAssignmentFormOptions;
  onSubmit: (data: AssetAssignmentFormData) => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  error?: ReactNode;
  className?: string;
}

const schema = z.object({
  assetRef: z.string().min(1, "Please select an asset"),
  assigneeRef: z.string().min(1, "Please select an assignee"),
  assigneeName: z
    .string()
    .min(1, "Assignee name is required")
    .max(200, "Name must be 200 characters or fewer"),
  assignmentDate: z.string().min(1, "Assignment date is required"),
  expectedReturnDate: z.string().max(10, "Invalid date"),
  notes: z.string().max(2000, "Notes must be 2000 characters or fewer"),
});

export function AssetAssignmentForm({
  options,
  onSubmit,
  onCancel,
  loading = false,
  error,
  className,
}: AssetAssignmentFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AssetAssignmentFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      assetRef: "",
      assigneeRef: "",
      assigneeName: "",
      assignmentDate: new Date().toISOString().split("T")[0],
      expectedReturnDate: "",
      notes: "",
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

  const handleValidSubmit = (data: AssetAssignmentFormData) => {
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
          <Spinner size="md" label="Loading assignment form" />
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(styles.container, className)}>
      {(error || submitError) && (
        <Alert
          variant="error"
          title="Unable to save assignment"
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
          title="Assignment details"
          description="Assign an asset to a person or department."
        >
          <FormField
            label="Asset"
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
                  placeholder="Select asset"
                  searchPlaceholder="Search assets..."
                  emptyText="No assets found"
                  invalid={!!errors.assetRef}
                  clearable
                />
              )}
            />
          </FormField>

          <FormField
            label="Assignee"
            required
            errorText={errors.assigneeRef?.message as string | undefined}
            invalid={!!errors.assigneeRef}
          >
            <Controller
              control={control}
              name="assigneeRef"
              render={({ field }) => (
                <Combobox
                  id="assigneeRef"
                  options={options.assigneeOptions}
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val);
                    const selected = options.assigneeOptions.find(
                      (o) => o.value === val,
                    );
                    if (selected) {
                      const nameField = document.getElementById(
                        "assigneeName",
                      ) as HTMLInputElement | null;
                      if (nameField && !nameField.value) {
                        nameField.value = selected.label;
                      }
                    }
                  }}
                  placeholder="Select assignee"
                  searchPlaceholder="Search assignees..."
                  emptyText="No assignees found"
                  invalid={!!errors.assigneeRef}
                  clearable
                />
              )}
            />
          </FormField>

          <FormField
            label="Assignee name"
            required
            errorText={errors.assigneeName?.message as string | undefined}
            invalid={!!errors.assigneeName}
          >
            <Input
              id="assigneeName"
              placeholder="Enter assignee name"
              {...register("assigneeName")}
              invalid={!!errors.assigneeName}
            />
          </FormField>

          <FormField
            label="Assignment date"
            required
            errorText={errors.assignmentDate?.message as string | undefined}
            invalid={!!errors.assignmentDate}
          >
            <Controller
              control={control}
              name="assignmentDate"
              render={({ field }) => (
                <DatePicker
                  id="assignmentDate"
                  value={field.value ? new Date(field.value) : null}
                  onValueChange={(d) => {
                    field.onChange(d ? d.toISOString().split("T")[0] : "");
                  }}
                  invalid={!!errors.assignmentDate}
                />
              )}
            />
          </FormField>

          <FormField
            label="Expected return date"
            helperText="Optional. When the asset is expected to be returned."
            errorText={errors.expectedReturnDate?.message as string | undefined}
            invalid={!!errors.expectedReturnDate}
          >
            <Controller
              control={control}
              name="expectedReturnDate"
              render={({ field }) => (
                <DatePicker
                  id="expectedReturnDate"
                  value={field.value ? new Date(field.value) : null}
                  onValueChange={(d) => {
                    field.onChange(d ? d.toISOString().split("T")[0] : "");
                  }}
                  invalid={!!errors.expectedReturnDate}
                  clearable
                />
              )}
            />
          </FormField>

          <FormField
            label="Notes"
            helperText="Optional. Any additional context about this assignment."
            errorText={errors.notes?.message as string | undefined}
            invalid={!!errors.notes}
          >
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Enter notes..."
              rows={3}
              invalid={!!errors.notes}
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
              leftIcon={<ArrowRightLeft aria-hidden="true" />}
            >
              Assign asset
            </Button>
          }
        />
      </form>
    </div>
  );
}
