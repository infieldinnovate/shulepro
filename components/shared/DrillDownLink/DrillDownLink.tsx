import type { ReactNode, MouseEvent } from "react";
import { ChevronRight, ExternalLink } from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/ui/Button";
import styles from "./DrillDownLink.module.scss";

/**
 * Arbitrary context payload describing what to drill into.
 * The shape is intentionally open so callers attach whatever
 * domain context they need (metric id, scope, filters, etc.).
 */
export interface DrillDownContext {
  [key: string]: unknown;
}

export interface DrillDownLinkProps {
  /** Visible label for the link/button. */
  children: ReactNode;
  /** Context payload passed to onDrillDown when activated. */
  context: DrillDownContext;
  /** Fired on click / Enter / Space. */
  onDrillDown?: (context: DrillDownContext) => void;
  /**
   * Optional href. When provided, renders an <a> (link). When omitted,
   * renders a <button> that triggers onDrillDown.
   */
  href?: string;
  /** Render an external-link icon when the href points elsewhere. */
  external?: boolean;
  /** Visual variant. */
  variant?: "inline" | "block";
  /** Show a trailing chevron indicating deeper detail. */
  showChevron?: boolean;
  /** Disable interaction (button mode only). */
  disabled?: boolean;
  className?: string;
}

export function DrillDownLink({
  children,
  context,
  onDrillDown,
  href,
  external = false,
  variant = "inline",
  showChevron = true,
  disabled = false,
  className,
}: DrillDownLinkProps) {
  const handleActivate = (event: MouseEvent) => {
    if (disabled) return;
    if (href && external) return; // let the anchor navigate naturally
    // Prevent navigation when a handler owns the behaviour.
    if (onDrillDown) {
      event.preventDefault();
      onDrillDown(context);
    }
  };

  const content = (
    <>
      <span className={styles.label}>{children}</span>
      {external ? (
        <ExternalLink className={styles.icon} aria-hidden="true" />
      ) : (
        showChevron && (
          <ChevronRight className={styles.icon} aria-hidden="true" />
        )
      )}
    </>
  );

  const sharedClass = clsx(
    styles.root,
    styles[variant],
    disabled && styles.disabled,
    className,
  );

  if (href) {
    const externalProps = external
      ? { target: "_blank" as const, rel: "noopener noreferrer" }
      : {};
    return (
      <a
        href={disabled ? undefined : href}
        className={sharedClass}
        onClick={handleActivate}
        aria-disabled={disabled || undefined}
        {...externalProps}
      >
        {content}
      </a>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={sharedClass}
      disabled={disabled}
      onClick={handleActivate}
    >
      {content}
    </Button>
  );
}
