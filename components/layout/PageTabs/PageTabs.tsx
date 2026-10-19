"use client";

import type { ComponentProps } from "react";
import { Tabs } from "../../ui/Tabs";
import type { TabItem, TabsOrientation } from "../../ui/Tabs";

export interface PageTabsProps extends Omit<ComponentProps<typeof Tabs>, "items"> {
  items: TabItem[];
  orientation?: TabsOrientation;
  ariaLabel?: string;
  className?: string;
}

export function PageTabs({
  items,
  orientation = "horizontal",
  ariaLabel,
  className,
  ...props
}: PageTabsProps) {
  return (
    <Tabs
      items={items}
      orientation={orientation}
      ariaLabel={ariaLabel}
      className={className}
      {...props}
    />
  );
}
