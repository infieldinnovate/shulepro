import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";
import styles from "./ScrollArea.module.scss";

export type ScrollAreaOrientation = "horizontal" | "vertical" | "both";

export interface ScrollAreaProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "content"> {
  /** Which axes to allow scrolling on. */
  orientation?: ScrollAreaOrientation;
  /** Render soft fade-mask edges along the scrollable axes. */
  fade?: boolean;
  /** Accessible label for the scrollable region. */
  ariaLabel?: string;
  /** Optional fixed height for vertical/both scrolling. */
  height?: string | number;
  /** Optional fixed width for horizontal/both scrolling. */
  width?: string | number;
  className?: string;
  children?: ReactNode;
}

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  (
    {
      orientation = "vertical",
      fade = false,
      ariaLabel,
      height,
      width,
      className,
      children,
      style,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
        className={clsx(
          styles.scrollArea,
          styles[orientation],
          fade && styles[`fade${orientation.charAt(0).toUpperCase()}${orientation.slice(1)}`],
          className,
        )}
        style={{ blockSize: height, inlineSize: width, ...style }}
        {...props}
      >
        <div className={styles.content}>{children}</div>
      </div>
    );
  },
);

ScrollArea.displayName = "ScrollArea";
