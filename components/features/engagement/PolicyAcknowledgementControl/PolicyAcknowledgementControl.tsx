"use client";

import { useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Checkbox } from "@/components/ui/Checkbox";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { ShieldCheck, FileSignature, CheckCircle2 } from "lucide-react";
import type {
  PolicyAcknowledgementType,
  DisabledState,
} from "@/components/features/engagement/models";
import styles from "./PolicyAcknowledgementControl.module.scss";

export type AcknowledgementStatus =
  | "pending"
  | "acknowledged"
  | "signed";

export interface PolicyAcknowledgementControlProps {
  /** Optional policy title for context. */
  policyTitle?: string;
  /** The kind of acknowledgement expected. */
  type: PolicyAcknowledgementType;
  /** Current acknowledgement status — supplied by the caller. */
  status: AcknowledgementStatus;
  /** Optional confirmation text the user is agreeing to. */
  confirmationText?: string;
  /** Optional label for the signed name field (legal-signature mode). */
  nameLabel?: string;
  /** Callback for a simple acknowledgement. */
  onAcknowledge?: () => void;
  /** Callback for a legal signature (passes the typed name). */
  onSign?: (typedName: string) => void;
  /** Loading state — shows a spinner on the action. */
  loading?: boolean;
  /** Disabled state — dims and blocks interaction. */
  disabled?: DisabledState;
  /** Optional error message. */
  error?: string;
  /** Optional slot for extra content above the control (e.g. policy summary). */
  children?: ReactNode;
  className?: string;
}

export function PolicyAcknowledgementControl({
  policyTitle,
  type,
  status,
  confirmationText,
  nameLabel = "Full legal name",
  onAcknowledge,
  onSign,
  loading = false,
  disabled,
  error,
  children,
  className,
}: PolicyAcknowledgementControlProps) {
  const [typedName, setTypedName] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const isDisabled = Boolean(disabled?.disabled);
  const isAcknowledged = status === "acknowledged" || status === "signed";
  const isLegalSignature = type === "legal-signature";

  const canAcknowledge =
    !isAcknowledged && !loading && !isDisabled && !error;

  const handleAcknowledge = () => {
    if (!canAcknowledge) return;
    onAcknowledge?.();
  };

  const handleSign = () => {
    if (!canAcknowledge || !typedName.trim()) return;
    onSign?.(typedName.trim());
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTypedName(e.target.value);
  };

  if (loading && !isAcknowledged) {
    return (
      <Card padded className={clsx(styles.loading, className)}>
        <Spinner size="md" label="Processing acknowledgement" />
      </Card>
    );
  }

  return (
    <Card
      padded={false}
      className={clsx(
        styles.control,
        isDisabled && styles.disabled,
        className,
      )}
      aria-disabled={isDisabled || undefined}
    >
      <div className={styles.body}>
        <div className={styles.header}>
          <span className={styles.icon}>
            {isLegalSignature ? (
              <FileSignature aria-hidden="true" />
            ) : (
              <ShieldCheck aria-hidden="true" />
            )}
          </span>
          <div className={styles.headerInfo}>
            <h3 className={styles.title}>
              {isLegalSignature ? "Legal signature required" : "Acknowledge policy"}
            </h3>
            {policyTitle && (
              <p className={styles.policyTitle}>{policyTitle}</p>
            )}
          </div>
          {isAcknowledged && (
            <span className={styles.acknowledgedBadge}>
              <CheckCircle2 aria-hidden="true" />
              <span>
                {status === "signed" ? "Signed" : "Acknowledged"}
              </span>
            </span>
          )}
        </div>

        {confirmationText && (
          <div className={styles.confirmation}>
            <p className={styles.confirmationText}>{confirmationText}</p>
          </div>
        )}

        {children && <div className={styles.extra}>{children}</div>}

        {error && (
          <Alert variant="error" title="Acknowledgement failed" description={error} />
        )}

        {isDisabled && disabled?.disabledReason && (
          <p className={styles.disabledReason}>{disabled.disabledReason}</p>
        )}

        {!isAcknowledged && !error && (
          <div className={styles.form}>
            {isLegalSignature ? (
              <>
                <div className={styles.field}>
                  <Label htmlFor="policy-signature-name" required>
                    {nameLabel}
                  </Label>
                  <Input
                    id="policy-signature-name"
                    value={typedName}
                    onChange={handleNameChange}
                    disabled={isDisabled || loading}
                    placeholder="Type your full legal name"
                  />
                </div>
                <Checkbox
                  label="I understand this constitutes a legally binding signature"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  disabled={isDisabled || loading}
                />
                <Button
                  variant="primary"
                  size="md"
                  loading={loading}
                  disabled={isDisabled || !typedName.trim() || !confirmed}
                  onClick={handleSign}
                  leftIcon={<FileSignature aria-hidden="true" />}
                >
                  Sign policy
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                size="md"
                loading={loading}
                disabled={isDisabled}
                onClick={handleAcknowledge}
                leftIcon={<ShieldCheck aria-hidden="true" />}
              >
                I acknowledge
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}