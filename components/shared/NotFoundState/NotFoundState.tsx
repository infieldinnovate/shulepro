import type { ReactNode } from "react";
import { SearchX } from "lucide-react";
import clsx from "clsx";
import { Button } from "../../ui/Button";
import styles from "./NotFoundState.module.scss";

export interface NotFoundStateProps {
  title?: string;
  message?: string;
  onNavigate?: () => void;
  navigateLabel?: string;
  icon?: ReactNode;
  className?: string;
}

export function NotFoundState({
  title = "Not found",
  message = "The record you are looking for could not be found.",
  onNavigate,
  navigateLabel = "Go back",
  icon,
  className,
}: NotFoundStateProps) {
  return (
    <div
      role="alert"
      className={clsx(styles.notFound, className)}
    >
      <span className={styles.iconWrap}>
        {icon ?? <SearchX aria-hidden="true" />}
      </span>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
      </div>
      {onNavigate && (
        <Button
          variant="secondary"
          onClick={onNavigate}
          aria-label={navigateLabel}
        >
          {navigateLabel}
        </Button>
      )}
    </div>
  );
}
