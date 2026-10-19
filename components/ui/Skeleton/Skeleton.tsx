import type { CSSProperties } from "react";
import clsx from "clsx";
import styles from "./Skeleton.module.scss";

export type SkeletonVariant = "rect" | "rounded" | "circle" | "text";

export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: CSSProperties;
}

export function Skeleton({
  variant = "rect",
  width,
  height,
  className,
  style,
}: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={clsx(styles.skeleton, styles[variant], className)}
      style={{
        inlineSize: width,
        blockSize: height,
        ...style,
      }}
    />
  );
}
