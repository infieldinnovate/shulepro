import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/ui/Button";
import styles from "./ErrorState.module.scss";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  icon?: ReactNode;
  fullScreen?: boolean;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  retryLabel = "Try again",
  icon,
  fullScreen = false,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={clsx(styles.errorState, fullScreen && styles.fullScreen, className)}
    >
      <span className={styles.iconWrap}>
        {icon ?? <AlertCircle aria-hidden="true" />}
      </span>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
      </div>
      {onRetry && (
        <Button
          variant="primary"
          onClick={onRetry}
          aria-label={retryLabel}
          className={styles.retryButton}
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
