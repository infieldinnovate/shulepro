"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/ui/Button";
import styles from "./OfflineNotice.module.scss";

export interface OfflineNoticeProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function OfflineNotice({
  message = "You appear to be offline. Some features may be unavailable.",
  onRetry,
  className,
}: OfflineNoticeProps) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setIsOnline(navigator.onLine);
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="assertive"
      className={clsx(styles.offlineNotice, className)}
    >
      <span className={styles.icon}>
        <WifiOff aria-hidden="true" />
      </span>
      <p className={styles.message}>{message}</p>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          className={styles.retryButton}
        >
          Retry
        </Button>
      )}
    </div>
  );
}