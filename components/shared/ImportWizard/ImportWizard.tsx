"use client";

import { useCallback, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CircleCheck as CheckCircle2, TriangleAlert as AlertTriangle, Loader as Loader2, FileUp } from "lucide-react";
import clsx from "clsx";
import { StepIndicator } from "../StepIndicator";
import type { StepStatus } from "../StepIndicator";
import { FormActions } from "../FormActions";
import { FileUploader, formatBytes } from "../FileUploader";
import { Combobox } from "../../ui/Combobox";
import { Button } from "../../ui/Button";
import { Alert } from "../../ui/Alert";
import { ConfirmActionDialog } from "../ConfirmActionDialog";
import { ImportValidationResults } from "../ImportValidationResults";
import type {
  ImportValidationResultEntry,
  ImportValidationSummary,
} from "../ImportValidationResults";
import styles from "./ImportWizard.module.scss";

export interface ImportTargetField {
  id: string;
  label: string;
  required?: boolean;
}

export type ImportMapping = Record<string, string>;

export interface ImportWizardProps {
  fileAccept?: string[];
  targetFields: ImportTargetField[];
  onValidate: (file: File) => Promise<ImportValidationResultEntry[]>;
  onConfirm: (mapping: ImportMapping) => void | Promise<void>;
  onCancel: () => void;
  /**
   * Parse source column headers from the file. When provided, the
   * mapping step shows detected columns. When omitted, the mapping
   * step informs the user that automatic detection is unavailable.
   */
  onParseColumns?: (file: File) => Promise<string[]>;
  maxSizeBytes?: number;
  className?: string;
}

const STEP_DEFS = [
  { id: "select", label: "Select file" },
  { id: "map", label: "Map fields" },
  { id: "validate", label: "Validate" },
  { id: "confirm", label: "Confirm" },
] as const;

export function ImportWizard({
  fileAccept,
  targetFields,
  onValidate,
  onConfirm,
  onCancel,
  onParseColumns,
  maxSizeBytes,
  className,
}: ImportWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [sourceColumns, setSourceColumns] = useState<string[]>([]);
  const [parsingColumns, setParsingColumns] = useState(false);
  const [mapping, setMapping] = useState<ImportMapping>({});
  const [validationResults, setValidationResults] = useState<
    ImportValidationResultEntry[]
  >([]);
  const [validationSummary, setValidationSummary] =
    useState<ImportValidationSummary>({ valid: 0, invalid: 0, total: 0 });
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [confirmSuccess, setConfirmSuccess] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const steps = useMemo(
    () =>
      STEP_DEFS.map((def, index) => {
        let status: StepStatus;
        if (index < currentStep) status = "completed";
        else if (index === currentStep) status = "current";
        else status = "blocked";
        return { ...def, status };
      }),
    [currentStep],
  );

  const targetOptions = useMemo(
    () =>
      targetFields.map((f) => ({
        value: f.id,
        label: f.required ? `${f.label} (required)` : f.label,
      })),
    [targetFields],
  );

  const unmappedRequiredFields = useMemo(() => {
    const mappedTargetIds = new Set(Object.values(mapping));
    return targetFields.filter((f) => f.required && !mappedTargetIds.has(f.id));
  }, [mapping, targetFields]);

  const isDirty =
    file !== null || currentStep > 0 || Object.keys(mapping).length > 0;

  const handleFileSelected = useCallback((files: File[]) => {
    setFile(files[0] ?? null);
    setSourceColumns([]);
    setMapping({});
    setValidationResults([]);
    setValidationSummary({ valid: 0, invalid: 0, total: 0 });
    setConfirmSuccess(false);
    setConfirmError(null);
    setValidationError(null);
  }, []);

  const handleMappingChange = useCallback(
    (sourceColumn: string, targetFieldId: string) => {
      setMapping((prev) => {
        const next = { ...prev };
        if (targetFieldId) {
          next[sourceColumn] = targetFieldId;
        } else {
          delete next[sourceColumn];
        }
        return next;
      });
    },
    [],
  );

  const handleStepClick = useCallback(
    (index: number) => {
      if (index < currentStep) setCurrentStep(index);
    },
    [currentStep],
  );

  const handleBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  const handleContinue = useCallback(async () => {
    if (currentStep === 0) {
      if (!file) return;
      if (onParseColumns && sourceColumns.length === 0) {
        setParsingColumns(true);
        try {
          const cols = await onParseColumns(file);
          setSourceColumns(cols);
        } catch {
          setSourceColumns([]);
        } finally {
          setParsingColumns(false);
        }
      }
      setCurrentStep(1);
    } else if (currentStep === 1) {
      if (!file) return;
      setCurrentStep(2);
      setValidating(true);
      setValidationError(null);
      try {
        const results = await onValidate(file);
        setValidationResults(results);
        setValidationSummary({
          valid: results.filter((r) => r.status === "valid").length,
          invalid: results.filter((r) => r.status === "invalid").length,
          total: results.length,
        });
      } catch (err) {
        setValidationError(
          err instanceof Error ? err.message : "Validation failed.",
        );
      } finally {
        setValidating(false);
      }
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  }, [currentStep, file, onParseColumns, sourceColumns.length, onValidate]);

  const handleConfirm = useCallback(async () => {
    if (!file || confirming || confirmSuccess) return;
    setConfirming(true);
    setConfirmError(null);
    try {
      const cleanMapping = Object.fromEntries(
        Object.entries(mapping).filter(([, v]) => v !== ""),
      );
      await onConfirm(cleanMapping);
      setConfirmSuccess(true);
    } catch (err) {
      setConfirmError(
        err instanceof Error ? err.message : "Import failed. Please try again.",
      );
    } finally {
      setConfirming(false);
    }
  }, [file, confirming, confirmSuccess, mapping, onConfirm]);

  const handleCancelRequest = useCallback(() => {
    if (isDirty && !confirmSuccess) {
      setShowCancelConfirm(true);
    } else {
      onCancel();
    }
  }, [isDirty, confirmSuccess, onCancel]);

  const continueDisabled =
    (currentStep === 0 && (!file || parsingColumns)) ||
    (currentStep === 1 && parsingColumns) ||
    (currentStep === 2 && (validating || validationError !== null)) ||
    (currentStep === 3 && (confirming || confirmSuccess));

  const continueLabel = currentStep === 3 ? "Confirm import" : "Continue";

  const submitButton = (
    <Button
      type="button"
      variant={currentStep === 3 ? "primary" : "secondary"}
      loading={
        validating || confirming || (parsingColumns && currentStep === 0)
      }
      disabled={continueDisabled}
      rightIcon={
        currentStep === 3 ? (
          <CheckCircle2 aria-hidden="true" />
        ) : (
          <ArrowRight aria-hidden="true" />
        )
      }
      onClick={currentStep === 3 ? handleConfirm : handleContinue}
    >
      {continueLabel}
    </Button>
  );

  return (
    <div className={clsx(styles.wizard, className)}>
      <StepIndicator
        steps={steps}
        onStepClick={handleStepClick}
        ariaLabel="Import wizard steps"
        className={styles.steps}
      />

      <div className={styles.stepContent}>
        {currentStep === 0 && (
          <div className={styles.stepPane}>
            <FileUploader
              accept={fileAccept}
              multiple={false}
              maxSizeBytes={maxSizeBytes}
              onFilesSelected={handleFileSelected}
              ariaLabel="Select file to import"
              helperText={
                fileAccept
                  ? `Accepted formats: ${fileAccept.join(", ")}`
                  : undefined
              }
            />
          </div>
        )}

        {currentStep === 1 && (
          <div className={styles.stepPane}>
            {parsingColumns ? (
              <div className={styles.loadingState}>
                <Loader2 className={styles.loadingSpinner} aria-hidden="true" />
                <p className={styles.loadingText}>Detecting columns&hellip;</p>
              </div>
            ) : sourceColumns.length === 0 ? (
              <Alert
                variant="info"
                title="Automatic column detection unavailable"
                description="You can proceed to validation. The validator will report any field issues."
              />
            ) : (
              <div className={styles.mappingList}>
                {sourceColumns.map((col) => (
                  <div className={styles.mappingRow} key={col}>
                    <div className={styles.mappingSource}>
                      <span className={styles.sourceLabel}>Source column</span>
                      <span className={styles.sourceName}>{col}</span>
                    </div>
                    <div className={styles.mappingTarget}>
                      <Combobox
                        label={col}
                        options={targetOptions}
                        value={mapping[col] ?? ""}
                        onValueChange={(val) => handleMappingChange(col, val)}
                        placeholder="Do not map"
                        searchPlaceholder="Search target fields&hellip;"
                        emptyText="No target fields found"
                        clearable
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {unmappedRequiredFields.length > 0 && (
              <Alert
                variant="warning"
                title="Required fields not mapped"
                description={`${unmappedRequiredFields.length} required field${unmappedRequiredFields.length === 1 ? "" : "s"} (${unmappedRequiredFields.map((f) => f.label).join(", ")}) have no source column mapped. Validation may flag these.`}
                className={styles.warningAlert}
              />
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div className={styles.stepPane}>
            {validating ? (
              <div className={styles.loadingState}>
                <Loader2 className={styles.loadingSpinner} aria-hidden="true" />
                <p className={styles.loadingText}>Validating&hellip;</p>
              </div>
            ) : validationError ? (
              <Alert
                variant="error"
                title="Validation failed"
                description={validationError}
                icon={<AlertTriangle aria-hidden="true" />}
                dismissible
                onDismiss={() => setValidationError(null)}
              />
            ) : (
              <ImportValidationResults
                results={validationResults}
                summary={validationSummary}
              />
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className={styles.stepPane}>
            {confirmSuccess ? (
              <Alert
                variant="success"
                title="Import confirmed"
                description="The import has been confirmed successfully."
                icon={<CheckCircle2 aria-hidden="true" />}
              />
            ) : (
              <div className={styles.confirmSummary}>
                {confirmError && (
                  <Alert
                    variant="error"
                    title="Import failed"
                    description={confirmError}
                    icon={<AlertTriangle aria-hidden="true" />}
                    dismissible
                    onDismiss={() => setConfirmError(null)}
                    className={styles.warningAlert}
                  />
                )}
                <section className={styles.summarySection}>
                  <h4 className={styles.summaryHeading}>File</h4>
                  <p className={styles.summaryText}>
                    <FileUp className={styles.summaryIcon} aria-hidden="true" />
                    {file?.name ?? "No file"}
                    {file ? ` (${formatBytes(file.size)})` : ""}
                  </p>
                </section>

                {sourceColumns.length > 0 && (
                  <section className={styles.summarySection}>
                    <h4 className={styles.summaryHeading}>Field mapping</h4>
                    <ul className={styles.mappingSummaryList}>
                      {sourceColumns.map((col) => {
                        const target = targetFields.find(
                          (f) => f.id === mapping[col],
                        );
                        return (
                          <li key={col} className={styles.mappingSummaryItem}>
                            <span className={styles.summarySource}>{col}</span>
                            <ArrowRight
                              className={styles.summaryArrow}
                              aria-hidden="true"
                            />
                            <span
                              className={
                                target
                                  ? styles.summaryTarget
                                  : styles.summaryUnmapped
                              }
                            >
                              {target?.label ?? "Not mapped"}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                )}

                <section className={styles.summarySection}>
                  <h4 className={styles.summaryHeading}>Validation</h4>
                  <p className={styles.summaryText}>
                    {validationSummary.valid} valid, {validationSummary.invalid}{" "}
                    invalid, {validationSummary.total} total
                    {validationSummary.invalid > 0 && (
                      <span className={styles.summaryWarning}>
                        {" "}
                        — {validationSummary.invalid} row
                        {validationSummary.invalid === 1 ? "" : "s"} need
                        attention
                      </span>
                    )}
                  </p>
                </section>
              </div>
            )}
          </div>
        )}
      </div>

      <FormActions
        secondary={
          currentStep > 0 && !confirmSuccess ? (
            <Button
              type="button"
              variant="ghost"
              leftIcon={<ArrowLeft aria-hidden="true" />}
              onClick={handleBack}
            >
              Back
            </Button>
          ) : undefined
        }
        cancel={
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancelRequest}
            disabled={confirming}
          >
            {confirmSuccess ? "Close" : "Cancel"}
          </Button>
        }
        submit={confirmSuccess ? undefined : submitButton}
        align="end"
        stretchMobile
      />

      <ConfirmActionDialog
        open={showCancelConfirm}
        onConfirm={() => {
          setShowCancelConfirm(false);
          onCancel();
        }}
        onCancel={() => setShowCancelConfirm(false)}
        title="Cancel import?"
        description="Your file selection and field mappings will be discarded."
        confirmLabel="Yes, cancel"
        cancelLabel="Keep editing"
        destructive
      />
    </div>
  );
}
