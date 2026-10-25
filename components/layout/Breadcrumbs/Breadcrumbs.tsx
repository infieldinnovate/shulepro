import type { ComponentProps } from "react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import type { BreadcrumbItem } from "@/components/ui/Breadcrumb";

export interface BreadcrumbsProps
  extends Omit<ComponentProps<typeof Breadcrumb>, "items"> {
  items: BreadcrumbItem[];
  maxItems?: number;
  ariaLabel?: string;
  className?: string;
}

export function Breadcrumbs({
  items,
  maxItems,
  ariaLabel,
  className,
  ...props
}: BreadcrumbsProps) {
  return (
    <Breadcrumb
      items={items}
      maxItems={maxItems}
      ariaLabel={ariaLabel}
      className={className}
      {...props}
    />
  );
}
