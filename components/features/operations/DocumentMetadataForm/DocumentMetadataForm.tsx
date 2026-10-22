"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText } from "lucide-react";
import clsx from "clsx";
import { Input } from "../../../ui/Input";
import { Textarea } from "../../../ui/Textarea";
import { Select } from "../../../ui/Select";
import type { SelectOption } from "../../../ui/Select";
import { DatePicker } from "../../../ui/DatePicker";
import { FormField } from "../../../ui/FormField";
import { Button } from "../../../ui/Button";
import { Spinner } from "../../../ui/Spinner";
import { Alert } from "../../../ui/Alert";
import { FormSection } from "../../../shared/FormSection";
import { FormActions } from "../../../shared/FormActions";
import { FormErrorSummary } from "../../../shared/FormErrorSummary";
import type { FormErrorEntry } from "../../../shared/FormErrorSummary";
import type { DocumentMetadata } from "../types";
import styles from "./DocumentMetadataForm.module.scss";

export interface DocumentMetadataFormOptions {
  documentTypes: SelectOption[];
  accessLevels: SelectOption[];
}

export interface DocumentMetadataFormProps {
  options: DocumentMetadataFormOptions;
  defaultValues?: Partial<DocumentMetadata>;
  onSubmit: (data: DocumentMetadata) => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  error?: ReactNode;
  className?: string;
}

const schema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or fewer"),
  documentType: z.string().min(1, "Please select a document type"),
  tags: z.string().max(500, "Tags must be 500 characters or fewer"),
  author: z.string().max(200, "Author must be 200 characters or fewer"),
  date: z.string().min(1, "Date is required"),
  description: z.string().max(2000, "Description must be 2000 characters or fewer"),
  accessLevel: z.string().min(1, "Please select an access level"),
});

export function DocumentMetadataForm({
  options,
  defaultValues,
  onSubmit,
  onCancel,
  loading = false,
  error,
  className,
}: DocumentMetadataFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<DocumentMetadata>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      documentType: "",
      tags: "",
      author: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      accessLevel: "",
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

  const handleValidSubmit = (data: DocumentMetadata) => {
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
          <Spinner size="md" label="Loading document form" />
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(styles.container, className)}>
      {(error || submitError) && (
        <Alert
          variant="error"
          title="Unable to save document"
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
          title="Document details"
          description="Edit the metadata for this document."
        >
          <div className={styles.fieldGrid}>
            <FormField
              label="Title"
              required
              errorText={errors.title?.message as string | undefined}
              invalid={!!errors.title}
            >
              <Input
                id="title"
                placeholder="Enter document title"
                {...register("title")}
                invalid={!!errors.title}
              />
            </FormField>

            <FormField
              label="Document type"
              required
              errorText={errors.documentType?.message as string | undefined}
              invalid={!!errors.documentType}
            >
              <Select
                id="documentType"
                options={options.documentTypes}
                placeholder="Select type"
                {...register("documentType")}
                invalid={!!errors.documentType}
              />
            </FormField>

            <FormField
              label="Author"
              helperText="Optional. Person who created or owns the document."
              errorText={errors.author?.message as string | undefined}
              invalid={!!errors.author}
            >
              <Input
                id="author"
                placeholder="Enter author name"
                {...register("author")}
                invalid={!!errors.author}
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
              label="Tags / keywords"
              helperText="Optional. Comma-separated keywords for search."
              errorText={errors.tags?.message as string | undefined}
              invalid={!!errors.tags}
            >
              <Input
                id="tags"
                placeholder="e.g. policy, curriculum, assessment"
                {...register("tags")}
                invalid={!!errors.tags}
              />
            </FormField>

            <FormField
              label="Access level"
              required
              helperText="Who can view this document."
              errorText={errors.accessLevel?.message as string | undefined}
              invalid={!!errors.accessLevel}
            >
              <Select
                id="accessLevel"
                options={options.accessLevels}
                placeholder="Select access level"
                {...register("accessLevel")}
                invalid={!!errors.accessLevel}
              />
            </FormField>
          </div>

          <FormField
            label="Description"
            helperText="Optional. Brief summary of the document contents."
            errorText={errors.description?.message as string | undefined}
            invalid={!!errors.description}
          >
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Enter description..."
              rows={3}
              invalid={!!errors.description}
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
              leftIcon={<FileText aria-hidden="true" />}
            >
              Save metadata
            </Button>
          }
        />
      </form>
    </div>
  );
}
