import type { ReactNode } from "react";
import clsx from "clsx";
import { Card } from "../../ui/Card";
import { Separator } from "../../ui/Separator";
import styles from "./FormSection.module.scss";

export type FormSectionVariant = "card" | "plain";

export interface FormSectionProps {
  title?: ReactNode;
  description?: ReactNode;
  /** Optional meta content rendered under the title (badges, hints). */
  meta?: ReactNode;
  /** Visual treatment: "card" wraps in a Card surface; "plain" renders bare. */
  variant?: FormSectionVariant;
  /** Render a separator after the section. */
  divider?: boolean;
  className?: string;
  bodyClassName?: string;
  children?: ReactNode;
}

export function FormSection({
  title,
  description,
  meta,
  variant = "card",
  divider = false,
  className,
  bodyClassName,
  children,
}: FormSectionProps) {
  const hasHeader = Boolean(title || description || meta);

  const inner = (
    <div className={clsx(styles.section, className)}>
      {hasHeader && (
        <div className={styles.header}>
          {title && <h3 className={styles.title}>{title}</h3>}
          {description && (
            <p className={styles.description}>{description}</p>
          )}
          {meta && <div className={styles.meta}>{meta}</div>}
        </div>
      )}
      <div className={clsx(styles.body, bodyClassName)}>{children}</div>
    </div>
  );

  const content =
    variant === "card" ? (
      <Card padded={false} className={styles.card}>
        {inner}
      </Card>
    ) : (
      <div className={styles.plain}>{inner}</div>
    );

  return (
    <section>
      {content}
      {divider && <Separator className={styles.divider} />}
    </section>
  );
}
