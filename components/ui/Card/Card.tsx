import type { HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";
import styles from "./Card.module.scss";

export type CardVariant = "default" | "borderless" | "elevated";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  /** Apply default inner padding. Set false to let subcomponents manage their own padding. */
  padded?: boolean;
}

export function Card({
  variant = "default",
  padded = true,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={clsx(
        styles.card,
        styles[variant],
        padded && styles.padded,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardSectionProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

function CardHeader({ className, children, ...props }: CardSectionProps) {
  return (
    <header className={clsx(styles.header, className)} {...props}>
      {children}
    </header>
  );
}

function CardBody({ className, children, ...props }: CardSectionProps) {
  return (
    <div className={clsx(styles.body, className)} {...props}>
      {children}
    </div>
  );
}

function CardFooter({ className, children, ...props }: CardSectionProps) {
  return (
    <footer className={clsx(styles.footer, className)} {...props}>
      {children}
    </footer>
  );
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
