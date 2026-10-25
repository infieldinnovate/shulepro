"use client";

import clsx from "clsx";
import { ImportWizard } from "@/components/shared/ImportWizard";
import type {
  ImportWizardProps,
  ImportTargetField,
  ImportMapping,
} from "@/components/shared/ImportWizard";
import type {
  ImportValidationResultEntry,
} from "@/components/shared/ImportValidationResults";
import styles from "./DataImportWizard.module.scss";

const DEFAULT_FILE_ACCEPT = [".csv", ".xlsx", ".xls"];

export interface DataImportWizardProps {
  targetFields: ImportTargetField[];
  onValidate: (file: File) => Promise<ImportValidationResultEntry[]>;
  onConfirm: (mapping: ImportMapping) => void | Promise<void>;
  onCancel: () => void;
  onParseColumns?: (file: File) => Promise<string[]>;
  fileAccept?: string[];
  maxSizeBytes?: number;
  className?: string;
}

export function DataImportWizard({
  targetFields,
  onValidate,
  onConfirm,
  onCancel,
  onParseColumns,
  fileAccept = DEFAULT_FILE_ACCEPT,
  maxSizeBytes,
  className,
}: DataImportWizardProps) {
  const wizardProps: ImportWizardProps = {
    fileAccept,
    targetFields,
    onValidate,
    onConfirm,
    onCancel,
    onParseColumns,
    maxSizeBytes,
  };

  return (
    <div className={clsx(styles.wrapper, className)}>
      <ImportWizard {...wizardProps} />
    </div>
  );
}
