"use client";

import { useState } from "react";
import { Lock, X } from "lucide-react";
import clsx from "clsx";
import { Alert } from "@/components/ui/Alert";
import styles from "./ConfidentialityBanner.module.scss";

export interface ConfidentialityBannerProps {
  message?: string;
  /** When true, allows the user to dismiss the banner. */
  dismissible?: boolean;
  className?: string;
}

export function ConfidentialityBanner({
  message = "This record is confidential. Access is restricted to authorized personnel.",
  dismissible = false,
  className,
}: ConfidentialityBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className={clsx(styles.container, className)}>
      <Alert
        variant="warning"
        icon={<Lock aria-hidden="true" />}
        title="Confidential record"
        description={message}
      />
      {dismissible && (
        <button
          type="button"
          className={styles.dismissBtn}
          aria-label="Dismiss confidentiality notice"
          onClick={() => setDismissed(true)}
        >
          <X aria-hidden="true" className={styles.dismissIcon} />
        </button>
      )}
    </div>
  );
}
