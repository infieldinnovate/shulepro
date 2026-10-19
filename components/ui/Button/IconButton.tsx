import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader as Loader2 } from "lucide-react";
import clsx from "clsx";
import { ButtonVariant, ButtonSize } from "./Button";
import styles from "./IconButton.module.scss";

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  variant?: ButtonVariant;
  size?: Exclude<ButtonSize, never>;
  loading?: boolean;
  label: string;
  children?: ReactNode;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      variant = "ghost",
      size = "md",
      loading = false,
      label,
      disabled,
      className,
      type = "button",
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-label={label}
        aria-busy={loading || undefined}
        className={clsx(
          styles.iconButton,
          styles[variant],
          styles[size],
          loading && styles.loading,
          className,
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className={styles.spinner} aria-hidden="true" />
        ) : (
          children
        )}
      </button>
    );
  },
);

IconButton.displayName = "IconButton";
