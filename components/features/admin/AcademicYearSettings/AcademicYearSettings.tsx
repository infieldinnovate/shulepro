"use client";

import { useCallback, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, isValid } from "date-fns";
import { Plus, Pencil, Trash2, Calendar } from "lucide-react";
import clsx from "clsx";
import { Card } from "../../../ui/Card";
import { Button } from "../../../ui/Button";
import { Input } from "../../../ui/Input";
import { Select } from "../../../ui/Select";
import type { SelectOption } from "../../../ui/Select";
import { DatePicker } from "../../../ui/DatePicker";
import { Badge } from "../../../ui/Badge";
import { EmptyState } from "../../../ui/EmptyState";
import { Dialog } from "../../../ui/Dialog";
import { FormField } from "../../../ui/FormField";
import { FormActions } from "../../../shared/FormActions";
import type { AcademicPeriod, AcademicPeriodFormData } from "../types";
import styles from "./AcademicYearSettings.module.scss";

export interface AcademicYearSettingsOptions {
  periodTypeOptions: SelectOption[];
  statusOptions: SelectOption[];
}

export interface AcademicYearSettingsProps {
  periods: AcademicPeriod[];
  options: AcademicYearSettingsOptions;
  onAddPeriod: (data: AcademicPeriodFormData) => void;
  onUpdatePeriod: (id: string, data: AcademicPeriodFormData) => void;
  onRemovePeriod: (id: string) => void;
  className?: string;
}

const periodSchema = z.object({
  name: z
    .string()
    .min(1, "Period name is required")
    .max(200, "Name must be 200 characters or fewer"),
  type: z.string().min(1, "Please select a period type"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  status: z.string().min(1, "Please select a status"),
});

function formatDate(d: string | undefined): string {
  if (!d) return "—";
  const date = new Date(d);
  return isValid(date) ? format(date, "MMM d, yyyy") : "—";
}

function statusVariant(status: string): "success" | "neutral" | "warning" {
  const s = status.toLowerCase();
  if (s.includes("active") || s.includes("current")) return "success";
  if (s.includes("upcoming") || s.includes("future")) return "warning";
  return "neutral";
}

export function AcademicYearSettings({
  periods,
  options,
  onAddPeriod,
  onUpdatePeriod,
  onRemovePeriod,
  className,
}: AcademicYearSettingsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AcademicPeriodFormData>({
    resolver: zodResolver(periodSchema),
    defaultValues: {
      name: "",
      type: "",
      startDate: "",
      endDate: "",
      status: "",
    },
    mode: "onTouched",
  });

  const openAddDialog = useCallback(() => {
    setEditingId(null);
    reset({
      name: "",
      type: options.periodTypeOptions[0]?.value ?? "",
      startDate: "",
      endDate: "",
      status: options.statusOptions[0]?.value ?? "",
    });
    setDialogOpen(true);
  }, [options, reset]);

  const openEditDialog = useCallback(
    (period: AcademicPeriod) => {
      setEditingId(period.id);
      reset({
        name: period.name,
        type: period.type,
        startDate: period.startDate,
        endDate: period.endDate,
        status: period.status,
      });
      setDialogOpen(true);
    },
    [reset],
  );

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingId(null);
  }, []);

  const handleValidSubmit = useCallback(
    (data: AcademicPeriodFormData) => {
      if (editingId) {
        onUpdatePeriod(editingId, data);
      } else {
        onAddPeriod(data);
      }
      closeDialog();
    },
    [editingId, onAddPeriod, onUpdatePeriod, closeDialog],
  );

  const handleFormSubmit = () => {
    handleSubmit(handleValidSubmit)();
  };

  const handleRemove = useCallback(
    (period: AcademicPeriod) => {
      onRemovePeriod(period.id);
    },
    [onRemovePeriod],
  );

  const dialogTitle = editingId ? "Edit period" : "Add period";

  return (
    <Card padded={false} className={clsx(styles.container, className)}>
      <div className={styles.header}>
        <h3 className={styles.title}>Academic periods</h3>
        <Button
          type="button"
          size="sm"
          onClick={openAddDialog}
          leftIcon={<Plus aria-hidden="true" />}
        >
          Add period
        </Button>
      </div>

      {periods.length === 0 ? (
        <div className={styles.emptyWrapper}>
          <EmptyState
            icon={<Calendar aria-hidden="true" />}
            title="No academic periods"
            description="Add terms, semesters, or quarters to configure your academic year."
            primaryAction={
              <Button
                type="button"
                size="sm"
                onClick={openAddDialog}
                leftIcon={<Plus aria-hidden="true" />}
              >
                Add period
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <div className={styles.cardList}>
            {periods.map((period) => (
              <div key={period.id} className={styles.periodCard}>
                <div className={styles.periodHeader}>
                  <span className={styles.periodName}>{period.name}</span>
                  <Badge variant={statusVariant(period.status)} size="sm" dot>
                    {period.status}
                  </Badge>
                </div>
                <div className={styles.periodMeta}>
                  <span className={styles.periodType}>{period.type}</span>
                  <span className={styles.periodDates}>
                    {formatDate(period.startDate)} — {formatDate(period.endDate)}
                  </span>
                </div>
                <div className={styles.periodActions}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(period)}
                    leftIcon={<Pencil aria-hidden="true" />}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(period)}
                    leftIcon={<Trash2 aria-hidden="true" />}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.tableWrapper} role="region" aria-label="Academic periods table" tabIndex={0}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Type</th>
                  <th scope="col">Start date</th>
                  <th scope="col">End date</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {periods.map((period) => (
                  <tr key={period.id}>
                    <td className={styles.nameCell}>{period.name}</td>
                    <td>{period.type}</td>
                    <td>{formatDate(period.startDate)}</td>
                    <td>{formatDate(period.endDate)}</td>
                    <td>
                      <Badge variant={statusVariant(period.status)} size="sm" dot>
                        {period.status}
                      </Badge>
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          type="button"
                          className={styles.iconButton}
                          onClick={() => openEditDialog(period)}
                          aria-label={`Edit ${period.name}`}
                        >
                          <Pencil size={14} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className={styles.iconButton}
                          onClick={() => handleRemove(period)}
                          aria-label={`Remove ${period.name}`}
                        >
                          <Trash2 size={14} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        title={dialogTitle}
        size="sm"
        footer={
          <FormActions
            cancel={
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
            }
            submit={
              <Button type="button" onClick={handleFormSubmit}>
                {editingId ? "Save changes" : "Add period"}
              </Button>
            }
          />
        }
      >
        <div className={styles.dialogBody}>
          <FormField
            label="Period name"
            required
            errorText={errors.name?.message as string | undefined}
            invalid={!!errors.name}
          >
            <Input
              placeholder="e.g. Term 1, Semester 1"
              {...register("name")}
              invalid={!!errors.name}
            />
          </FormField>

          <div className={styles.dialogFieldGrid}>
            <FormField
              label="Period type"
              required
              errorText={errors.type?.message as string | undefined}
              invalid={!!errors.type}
            >
              <Select
                options={options.periodTypeOptions}
                placeholder="Select type"
                {...register("type")}
                invalid={!!errors.type}
              />
            </FormField>

            <FormField
              label="Status"
              required
              errorText={errors.status?.message as string | undefined}
              invalid={!!errors.status}
            >
              <Select
                options={options.statusOptions}
                placeholder="Select status"
                {...register("status")}
                invalid={!!errors.status}
              />
            </FormField>
          </div>

          <div className={styles.dialogFieldGrid}>
            <FormField
              label="Start date"
              required
              errorText={errors.startDate?.message as string | undefined}
              invalid={!!errors.startDate}
            >
              <Controller
                control={control}
                name="startDate"
                render={({ field }) => (
                  <DatePicker
                    value={field.value ? new Date(field.value) : null}
                    onValueChange={(d) => {
                      field.onChange(d ? d.toISOString().split("T")[0] : "");
                    }}
                    invalid={!!errors.startDate}
                  />
                )}
              />
            </FormField>

            <FormField
              label="End date"
              required
              errorText={errors.endDate?.message as string | undefined}
              invalid={!!errors.endDate}
            >
              <Controller
                control={control}
                name="endDate"
                render={({ field }) => (
                  <DatePicker
                    value={field.value ? new Date(field.value) : null}
                    onValueChange={(d) => {
                      field.onChange(d ? d.toISOString().split("T")[0] : "");
                    }}
                    invalid={!!errors.endDate}
                  />
                )}
              />
            </FormField>
          </div>
        </div>
      </Dialog>
    </Card>
  );
}
