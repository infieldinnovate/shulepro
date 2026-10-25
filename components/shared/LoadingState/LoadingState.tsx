import type { ReactNode } from "react";
import clsx from "clsx";
import { Spinner } from "@/components/ui/Spinner";
import { Skeleton } from "@/components/ui/Skeleton";
import styles from "./LoadingState.module.scss";

export type LoadingStateVariant = "spinner" | "skeleton";

export interface LoadingStateProps {
  title?: string;
  message?: string;
  variant?: LoadingStateVariant;
  fullScreen?: boolean;
  className?: string;
  children?: ReactNode;
}

export function LoadingState({
  title,
  message,
  variant = "spinner",
  fullScreen = false,
  className,
  children,
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={clsx(
        styles.loadingState,
        fullScreen && styles.fullScreen,
        className,
      )}
    >
      <span className={styles.srOnly}>Loading{title ? `: ${title}` : ""}</span>
      {variant === "spinner" ? (
        <div className={styles.spinnerBlock}>
          <Spinner size="lg" />
          {(title || message) && (
            <div className={styles.text}>
              {title && <p className={styles.title}>{title}</p>}
              {message && <p className={styles.message}>{message}</p>}
            </div>
          )}
        </div>
      ) : (
        <div className={styles.skeletonBlock}>
          {title && <Skeleton variant="text" width="40%" height="1.5rem" />}
          {message && <Skeleton variant="text" width="60%" height="1rem" />}
          <div className={styles.skeletonLines}>
            <Skeleton variant="text" width="100%" height="1rem" />
            <Skeleton variant="text" width="90%" height="1rem" />
            <Skeleton variant="text" width="75%" height="1rem" />
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
