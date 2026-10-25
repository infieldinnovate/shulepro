"use client";

import type { ReactNode } from "react";
import clsx from "clsx";
import { Sheet } from "@/components/ui/Sheet";
import type { SheetSize } from "@/components/ui/Sheet";
import { Separator } from "@/components/ui/Separator";
import styles from "./RecordDetailPanel.module.scss";

export interface RecordDetailField {
  label: ReactNode;
  value: ReactNode;
}

export interface RecordDetailSection {
  title?: ReactNode;
  fields: RecordDetailField[];
}

export interface RecordDetailPanelProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  /** Flat list of top-level fields rendered before any sections. */
  fields?: RecordDetailField[];
  /** Grouped sections of fields. */
  sections?: RecordDetailSection[];
  /** Optional footer (actions, metadata). */
  footer?: ReactNode;
  /** Sheet size on desktop. Defaults to "md". Mobile is always full-width. */
  size?: SheetSize;
  /** Render as an inline card instead of a side sheet. */
  inline?: boolean;
  className?: string;
  bodyClassName?: string;
  footerClassName?: string;
  ariaLabel?: string;
}

export function RecordDetailPanel({
  open,
  onClose,
  title,
  description,
  fields,
  sections,
  footer,
  size = "md",
  inline = false,
  className,
  bodyClassName,
  footerClassName,
  ariaLabel,
}: RecordDetailPanelProps) {
  const flatFields = fields ?? [];
  const grouped = sections ?? [];
  const hasContent = flatFields.length > 0 || grouped.length > 0;

  if (inline) {
    return (
      <section
        className={clsx(styles.inline, className)}
        aria-label={ariaLabel}
      >
        {(title || description) && (
          <header className={styles.inlineHeader}>
            {title && <h2 className={styles.inlineTitle}>{title}</h2>}
            {description && (
              <p className={styles.inlineDescription}>{description}</p>
            )}
          </header>
        )}
        {hasContent && (
          <div className={clsx(styles.body, bodyClassName)}>
            {flatFields.length > 0 && (
              <FieldGrid fields={flatFields} />
            )}
            {grouped.map((section, index) => (
              <SectionBlock key={index} section={section} />
            ))}
          </div>
        )}
        {footer && (
          <footer className={clsx(styles.inlineFooter, footerClassName)}>
            {footer}
          </footer>
        )}
      </section>
    );
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size={size}
      ariaLabel={ariaLabel}
      className={clsx(styles.sheet, className)}
      bodyClassName={clsx(styles.body, bodyClassName)}
      footerClassName={clsx(styles.footer, footerClassName)}
      footer={footer}
    >
      {hasContent ? (
        <>
          {flatFields.length > 0 && <FieldGrid fields={flatFields} />}
          {grouped.map((section, index) => (
            <SectionBlock key={index} section={section} />
          ))}
        </>
      ) : (
        <p className={styles.empty}>No details available.</p>
      )}
    </Sheet>
  );
}

function FieldGrid({ fields }: { fields: RecordDetailField[] }) {
  return (
    <dl className={styles.fieldGrid}>
      {fields.map((field, index) => (
        <div className={styles.fieldItem} key={index}>
          <dt className={styles.fieldLabel}>{field.label}</dt>
          <dd className={styles.fieldValue}>{field.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function SectionBlock({ section }: { section: RecordDetailSection }) {
  return (
    <div className={styles.section}>
      {section.title && (
        <>
          <h3 className={styles.sectionTitle}>{section.title}</h3>
          <Separator className={styles.sectionDivider} />
        </>
      )}
      <FieldGrid fields={section.fields} />
    </div>
  );
}
