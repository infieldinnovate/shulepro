"use client";

import { useId, useState } from "react";
import type { ReactNode } from "react";
import { Info } from "lucide-react";
import clsx from "clsx";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Label } from "@/components/ui/Label";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { FormActions } from "@/components/shared/FormActions";
import styles from "./SignatureOrAcknowledgement.module.scss";

export interface SignatureOrAcknowledgementProps {
  /** The text being acknowledged, shown in a read-only panel. */
  statement: ReactNode;
  /** Called when the user confirms the acknowledgement. */
  onAcknowledge: (context: { typedName: string; agreed: boolean }) => void;
  /** Require the user to type their name. Defaults to true. */
  requireTypedName?: boolean;
  /** Require the checkbox agreement. Defaults to true. */
  requireCheckbox?: boolean;
  /** Disable all inputs. */
  disabled?: boolean;
  /** Show the submit button as loading. */
  submitting?: boolean;
  /** Label for the typed-name field. */
  nameLabel?: ReactNode;
  /** Placeholder for the typed-name field. */
  namePlaceholder?: string;
  /** Label for the agreement checkbox. */
  checkboxLabel?: ReactNode;
  /** Submit button label. */
  submitLabel?: string;
  /** Override the default acknowledgement disclaimer. */
  disclaimer?: ReactNode;
  ariaLabel?: string;
  className?: string;
}

export function SignatureOrAcknowledgement({
  statement,
  onAcknowledge,
  requireTypedName = true,
  requireCheckbox = true,
  disabled = false,
  submitting = false,
  nameLabel = "Type your full name",
  namePlaceholder = "Full name",
  checkboxLabel = "I have read and understand the statement above.",
  submitLabel = "Acknowledge",
  disclaimer,
  ariaLabel = "Acknowledgement",
  className,
}: SignatureOrAcknowledgementProps) {
  const generatedId = useId();
  const nameId = `${generatedId}-name`;
  const checkboxId = `${generatedId}-agree`;

  const [typedName, setTypedName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const nameEmpty = requireTypedName && typedName.trim().length === 0;
  const checkboxMissing = requireCheckbox && !agreed;
  const showNameError = attempted && nameEmpty;
  const showCheckboxError = attempted && checkboxMissing;

  const canSubmit = !disabled && !submitting && !nameEmpty && !checkboxMissing;

  const handleSubmit = () => {
    setAttempted(true);
    if (!canSubmit) return;
    onAcknowledge({ typedName: typedName.trim(), agreed });
  };

  const defaultDisclaimer = (
    <>
      This is an acknowledgement of your review, not a legally binding
      electronic signature. It records that you confirmed the statement
      above; it does not create a signed contract and is not a substitute
      for a formal signing process where one is required.
    </>
  );

  return (
    <section
      className={clsx(styles.container, className)}
      aria-label={ariaLabel}
    >
      <div className={styles.statement}>{statement}</div>

      <Alert
        variant="info"
        icon={<Info aria-hidden="true" />}
        className={styles.disclaimer}
      >
        {disclaimer ?? defaultDisclaimer}
      </Alert>

      <div className={styles.fields}>
        {requireTypedName && (
          <div className={styles.nameField}>
            <Label htmlFor={nameId} required>
              {nameLabel}
            </Label>
            <Input
              id={nameId}
              value={typedName}
              placeholder={namePlaceholder}
              disabled={disabled || submitting}
              invalid={showNameError}
              autoComplete="name"
              aria-describedby={showNameError ? `${nameId}-error` : undefined}
              onChange={(e) => setTypedName(e.target.value)}
            />
            {showNameError && (
              <p
                id={`${nameId}-error`}
                role="alert"
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-error-700)",
                  fontWeight: "var(--font-weight-medium)",
                }}
              >
                Please type your name to acknowledge.
              </p>
            )}
          </div>
        )}

        {requireCheckbox && (
          <Checkbox
            id={checkboxId}
            checked={agreed}
            invalid={showCheckboxError}
            disabled={disabled || submitting}
            label={checkboxLabel}
            onChange={(e) => setAgreed(e.target.checked)}
          />
        )}
      </div>

      <FormActions
        submit={
          <Button
            type="button"
            loading={submitting}
            disabled={disabled || submitting || (attempted && !canSubmit)}
            onClick={handleSubmit}
          >
            {submitLabel}
          </Button>
        }
        className={styles.actions}
      />
    </section>
  );
}
