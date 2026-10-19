import type { HTMLAttributes } from "react";
import clsx from "clsx";
import styles from "./Separator.module.scss";

export type SeparatorOrientation = "horizontal" | "vertical";

export interface SeparatorProps extends HTMLAttributes<HTMLSpanElement> {
  orientation?: SeparatorOrientation;
  /**
   * When `decorative`, the element is hidden from the accessibility tree
   * (aria-hidden). When `semantic` (default), it is exposed with
   * role="separator" and aria-orientation.
   */
  semantic?: boolean;
  /** Accessible label for a semantic separator. */
  label?: string;
  className?: string;
}

export function Separator({
  orientation = "horizontal",
  semantic = true,
  label,
  className,
  ...props
}: SeparatorProps) {
  return (
    <span
      role={semantic ? "separator" : undefined}
      aria-orientation={semantic ? orientation : undefined}
      aria-label={semantic ? label : undefined}
      aria-hidden={semantic ? undefined : true}
      className={clsx(styles.separator, styles[orientation], className)}
      data-orientation={orientation}
      {...props}
    />
  );
}