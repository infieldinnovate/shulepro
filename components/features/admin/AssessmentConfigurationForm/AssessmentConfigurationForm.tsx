"use client";

import { useCallback, useState } from "react";
import { Plus, Trash2, Save, GripVertical } from "lucide-react";
import clsx from "clsx";
import { Input } from "@/components/ui/Input";
import { Button, IconButton } from "@/components/ui/Button";
import { FormSection } from "@/components/shared/FormSection";
import { FormActions } from "@/components/shared/FormActions";
import type {
  AssessmentTypeEntry,
  DescriptorEntry,
  ScaleLevelEntry,
  AssessmentConfigurationFormData,
} from "@/components/features/admin/types";
import styles from "./AssessmentConfigurationForm.module.scss";

export interface AssessmentConfigurationFormProps {
  defaultAssessmentTypes?: AssessmentTypeEntry[];
  defaultDescriptors?: DescriptorEntry[];
  defaultScaleLevels?: ScaleLevelEntry[];
  onSubmit: (data: AssessmentConfigurationFormData) => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  className?: string;
}

function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function AssessmentConfigurationForm({
  defaultAssessmentTypes = [],
  defaultDescriptors = [],
  defaultScaleLevels = [],
  onSubmit,
  onCancel,
  loading = false,
  className,
}: AssessmentConfigurationFormProps) {
  const [assessmentTypes, setAssessmentTypes] = useState<AssessmentTypeEntry[]>(
    defaultAssessmentTypes,
  );
  const [descriptors, setDescriptors] = useState<DescriptorEntry[]>(
    defaultDescriptors,
  );
  const [scaleLevels, setScaleLevels] = useState<ScaleLevelEntry[]>(
    defaultScaleLevels,
  );

  const addAssessmentType = useCallback(() => {
    setAssessmentTypes((prev) => [
      ...prev,
      { id: generateId("type"), label: "", weight: 0 },
    ]);
  }, []);

  const updateAssessmentType = useCallback(
    (id: string, field: keyof AssessmentTypeEntry, value: string | number) => {
      setAssessmentTypes((prev) =>
        prev.map((entry) =>
          entry.id === id ? { ...entry, [field]: value } : entry,
        ),
      );
    },
    [],
  );

  const removeAssessmentType = useCallback((id: string) => {
    setAssessmentTypes((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const addDescriptor = useCallback(() => {
    setDescriptors((prev) => [
      ...prev,
      { id: generateId("desc"), label: "" },
    ]);
  }, []);

  const updateDescriptor = useCallback(
    (id: string, value: string) => {
      setDescriptors((prev) =>
        prev.map((entry) =>
          entry.id === id ? { ...entry, label: value } : entry,
        ),
      );
    },
    [],
  );

  const removeDescriptor = useCallback((id: string) => {
    setDescriptors((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const addScaleLevel = useCallback(() => {
    setScaleLevels((prev) => [
      ...prev,
      { id: generateId("scale"), label: "", value: 0 },
    ]);
  }, []);

  const updateScaleLevel = useCallback(
    (id: string, field: keyof ScaleLevelEntry, value: string | number) => {
      setScaleLevels((prev) =>
        prev.map((entry) =>
          entry.id === id ? { ...entry, [field]: value } : entry,
        ),
      );
    },
    [],
  );

  const removeScaleLevel = useCallback((id: string) => {
    setScaleLevels((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const handleSubmit = useCallback(() => {
    onSubmit({ assessmentTypes, descriptors, scaleLevels });
  }, [assessmentTypes, descriptors, scaleLevels, onSubmit]);

  return (
    <div className={clsx(styles.container, className)}>
      <FormSection
        title="Assessment types"
        description="Define the types of assessments used (e.g. exam, project, quiz). Assign a weight to each."
      >
        <div className={styles.entryList}>
          {assessmentTypes.map((entry) => (
            <div key={entry.id} className={styles.entryRow}>
              <span className={styles.gripIcon} aria-hidden="true">
                <GripVertical size={16} />
              </span>
              <Input
                placeholder="Assessment type name"
                value={entry.label}
                onChange={(e) =>
                  updateAssessmentType(entry.id, "label", e.target.value)
                }
                aria-label="Assessment type name"
              />
              <Input
                type="number"
                inputSize="sm"
                placeholder="Weight"
                value={String(entry.weight)}
                onChange={(e) =>
                  updateAssessmentType(
                    entry.id,
                    "weight",
                    parseFloat(e.target.value) || 0,
                  )
                }
                aria-label="Assessment weight"
                className={styles.weightInput}
              />
              <IconButton
                label="Remove assessment type"
                size="sm"
                onClick={() => removeAssessmentType(entry.id)}
              >
                <Trash2 size={16} aria-hidden="true" />
              </IconButton>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addAssessmentType}
          leftIcon={<Plus aria-hidden="true" />}
        >
          Add assessment type
        </Button>
      </FormSection>

      <FormSection
        title="Descriptors"
        description="Define grading descriptors (e.g. excellent, proficient, developing)."
      >
        <div className={styles.entryList}>
          {descriptors.map((entry) => (
            <div key={entry.id} className={styles.entryRow}>
              <span className={styles.gripIcon} aria-hidden="true">
                <GripVertical size={16} />
              </span>
              <Input
                placeholder="Descriptor label"
                value={entry.label}
                onChange={(e) => updateDescriptor(entry.id, e.target.value)}
                aria-label="Descriptor label"
              />
              <IconButton
                label="Remove descriptor"
                size="sm"
                onClick={() => removeDescriptor(entry.id)}
              >
                <Trash2 size={16} aria-hidden="true" />
              </IconButton>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addDescriptor}
          leftIcon={<Plus aria-hidden="true" />}
        >
          Add descriptor
        </Button>
      </FormSection>

      <FormSection
        title="Performance scale levels"
        description="Define the numeric scale and labels for performance levels."
      >
        <div className={styles.entryList}>
          {scaleLevels.map((entry) => (
            <div key={entry.id} className={styles.entryRow}>
              <span className={styles.gripIcon} aria-hidden="true">
                <GripVertical size={16} />
              </span>
              <Input
                placeholder="Scale level label"
                value={entry.label}
                onChange={(e) =>
                  updateScaleLevel(entry.id, "label", e.target.value)
                }
                aria-label="Scale level label"
              />
              <Input
                type="number"
                inputSize="sm"
                placeholder="Value"
                value={String(entry.value)}
                onChange={(e) =>
                  updateScaleLevel(
                    entry.id,
                    "value",
                    parseFloat(e.target.value) || 0,
                  )
                }
                aria-label="Scale level numeric value"
                className={styles.weightInput}
              />
              <IconButton
                label="Remove scale level"
                size="sm"
                onClick={() => removeScaleLevel(entry.id)}
              >
                <Trash2 size={16} aria-hidden="true" />
              </IconButton>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addScaleLevel}
          leftIcon={<Plus aria-hidden="true" />}
        >
          Add scale level
        </Button>
      </FormSection>

      <FormActions
        cancel={
          onCancel ? (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          ) : undefined
        }
        submit={
          <Button
            type="button"
            onClick={handleSubmit}
            loading={loading}
            leftIcon={<Save aria-hidden="true" />}
          >
            Save configuration
          </Button>
        }
      />
    </div>
  );
}
