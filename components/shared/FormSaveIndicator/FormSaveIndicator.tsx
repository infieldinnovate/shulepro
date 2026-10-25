"use client";

import type { ReactNode } from "react";
import { CheckCircle2, AlertCircle, Save } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import clsx from "clsx";
import styles from "./FormSaveIndicator.module.scss";

export type FormSaveState = "idle" | "saving" | "saved" | "error";

export interface FormSaveIndicatorProps {
  state: FormSaveState;
  /** Optional override for the visible label text. */
  savingLabel?: string;
  savedLabel?: string;
  errorLabel?: string;
  idleLabel?: string;
  /** Hide the icon (text only). */
  hideIcon?: boolean;
  className?: string;
}

const STATUS_TEXT: Record<FormSaveState, string> = {
  idle: "Not saved",
  saving: "Saving\u2026",
  saved: "Saved",
  error: "Save failed",
};

export function FormSaveIndicator({
  state,
  savingLabel,
  savedLabel,
  errorLabel,
  idleLabel,
  hideIcon = false,
  className,
}: FormSaveIndicatorProps) {
  const label =
    (state === "idle" && idleLabel) ||
    (state === "saving" && savingLabel) ||
    (state === "saved" && savedLabel) ||
    (state === "error" && errorLabel) ||
    STATUS_TEXT[state];

  const live = state === "saving" ? "polite" : state === "error" ? "assertive" : "polite";

  let icon: ReactNode = null;
  if (!hideIcon) {
    if (state === "saving") {
      icon = <Spinner size="sm" aria-hidden="true" />;
    } else if (state === "saved") {
      icon = <CheckCircle2 aria-hidden="true" />;
    } else if (state === "error") {
      icon = <AlertCircle aria-hidden="true" />;
    } else {
      icon = <Save aria-hidden="true" />;
    }
  }

  return (
    <span
      className={clsx(styles.indicator, styles[state], className)}
      role="status"
      aria-live={live}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.text}>{label}</span>
    </span>
  );
}
