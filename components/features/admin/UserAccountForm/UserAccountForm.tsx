"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
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
import type { UserAccountFormData } from "@/components/features/admin/types";
import styles from "./UserAccountForm.module.scss";

export interface UserAccountFormOptions {
  roleOptions: SelectOption[];
  statusOptions: SelectOption[];
}

export interface UserAccountFormProps {
  options: UserAccountFormOptions;
  defaultValues?: Partial<UserAccountFormData>;
  mode?: "create" | "edit";
  onSubmit: (data: UserAccountFormData) => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  error?: ReactNode;
  className?: string;
}

const schema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .max(200, "Name must be 200 characters or fewer"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  role: z.string().min(1, "Please select a role"),
  status: z.string().min(1, "Please select a status"),
  phone: z.string().max(50, "Phone must be 50 characters or fewer"),
  department: z.string().max(200, "Department must be 200 characters or fewer"),
});

export function UserAccountForm({
  options,
  defaultValues,
  mode = "create",
  onSubmit,
  onCancel,
  loading = false,
  error,
  className,
}: UserAccountFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserAccountFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      role: "",
      status: "",
      phone: "",
      department: "",
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

  const handleValidSubmit = (data: UserAccountFormData) => {
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
          <Spinner size="md" label="Loading user account form" />
        </div>
      </div>
    );
  }

  const submitLabel = mode === "edit" ? "Save changes" : "Create user";

  return (
    <div className={clsx(styles.container, className)}>
      {(error || submitError) && (
        <Alert
          variant="error"
          title="Unable to save user account"
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
          title={mode === "edit" ? "Edit user account" : "Create user account"}
          description="Manage the user's profile, role, and access status."
        >
          <div className={styles.fieldGrid}>
            <FormField
              label="Full name"
              required
              errorText={errors.fullName?.message as string | undefined}
              invalid={!!errors.fullName}
            >
              <Input
                id="fullName"
                placeholder="Enter full name"
                {...register("fullName")}
                invalid={!!errors.fullName}
              />
            </FormField>

            <FormField
              label="Email"
              required
              errorText={errors.email?.message as string | undefined}
              invalid={!!errors.email}
            >
              <Input
                id="email"
                type="email"
                placeholder="user@institution.edu"
                {...register("email")}
                invalid={!!errors.email}
              />
            </FormField>

            <FormField
              label="Role"
              required
              errorText={errors.role?.message as string | undefined}
              invalid={!!errors.role}
            >
              <Select
                id="role"
                options={options.roleOptions}
                placeholder="Select role"
                {...register("role")}
                invalid={!!errors.role}
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
                options={options.statusOptions}
                placeholder="Select status"
                {...register("status")}
                invalid={!!errors.status}
              />
            </FormField>

            <FormField
              label="Phone"
              helperText="Optional. Contact phone number."
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
              label="Department"
              helperText="Optional. Department or unit assignment."
              errorText={errors.department?.message as string | undefined}
              invalid={!!errors.department}
            >
              <Input
                id="department"
                placeholder="e.g. Science, Administration"
                {...register("department")}
                invalid={!!errors.department}
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
              leftIcon={<UserPlus aria-hidden="true" />}
            >
              {submitLabel}
            </Button>
          }
        />
      </form>
    </div>
  );
}
