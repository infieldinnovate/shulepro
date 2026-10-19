import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import clsx from "clsx";
import styles from "./Breadcrumb.module.scss";

export interface BreadcrumbItem {
  label: ReactNode;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  /** Max number of items rendered before middle items collapse to an ellipsis. */
  maxItems?: number;
  /** Accessible label for the breadcrumb navigation region. */
  ariaLabel?: string;
  className?: string;
}

type Slot =
  | {
      kind: "item";
      item: BreadcrumbItem;
      current: boolean;
      collapsible: boolean;
    }
  | { kind: "ellipsis" };

export function Breadcrumb({
  items,
  maxItems,
  ariaLabel = "Breadcrumb",
  className,
}: BreadcrumbProps) {
  const total = items.length;
  const cap =
    typeof maxItems === "number" && maxItems >= 2 ? maxItems : total;
  const lastIndex = total - 1;

  const slots: Slot[] = [];
  if (total > cap) {
    const headCount = 1;
    const tailCount = Math.max(cap - headCount - 1, 1);
    items.slice(0, headCount).forEach((item, i) =>
      slots.push({
        kind: "item",
        item,
        current: i === lastIndex,
        collapsible: false,
      }),
    );
    slots.push({ kind: "ellipsis" });
    items.slice(total - tailCount).forEach((item, i) => {
      const index = total - tailCount + i;
      slots.push({
        kind: "item",
        item,
        current: index === lastIndex,
        collapsible: index !== lastIndex,
      });
    });
  } else {
    items.forEach((item, i) =>
      slots.push({
        kind: "item",
        item,
        current: i === lastIndex,
        collapsible: i !== 0 && i !== lastIndex,
      }),
    );
  }

  return (
    <nav aria-label={ariaLabel} className={clsx(styles.nav, className)}>
      <ol className={styles.list}>
        {slots.map((slot, idx) => {
          if (slot.kind === "ellipsis") {
            return (
              <li
                key={`ellipsis-${idx}`}
                className={styles.item}
                aria-hidden="true"
              >
                <span className={styles.ellipsis}>&#8230;</span>
                <ChevronRight className={styles.chevron} aria-hidden="true" />
              </li>
            );
          }
          const { item, current, collapsible } = slot;
          return (
            <li
              key={`item-${idx}`}
              className={clsx(styles.item, collapsible && styles.collapsible)}
            >
              {current || !item.href ? (
                <span className={styles.current} aria-current="page">
                  {item.label}
                </span>
              ) : (
                <a className={styles.link} href={item.href}>
                  {item.label}
                </a>
              )}
              {!current && (
                <ChevronRight className={styles.chevron} aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}