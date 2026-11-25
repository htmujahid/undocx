"use client";

import {
  Menu,
  MenuContent as MenuContentPrimitive,
  MenuGroup,
  MenuGroupLabel as MenuGroupLabelPrimitive,
  MenuItem as MenuItemPrimitive,
  MenuItemIcon as MenuItemIconPrimitive,
  MenuSeparator as MenuSeparatorPrimitive,
  MenuTrigger,
} from "@ui-sdk/react/menu";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "~@/lib/utils";

type WithChildren<T> = Omit<T, "children"> & { children?: ReactNode };

function MenuContent({ className, ...props }: WithChildren<ComponentProps<typeof MenuContentPrimitive>>) {
  return (
    <MenuContentPrimitive
      sideOffset={4}
      className={cn(
        "z-50 min-w-40 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md origin-(--transform-origin) transition-[opacity,scale] duration-100 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}

function MenuItem({ className, children, icon, trailing, ...props }: WithChildren<ComponentProps<typeof MenuItemPrimitive>> & { icon?: ReactNode; trailing?: ReactNode }) {
  return (
    <MenuItemPrimitive
      className={cn("flex cursor-default items-center gap-2.5 rounded-sm px-2 py-1.5 text-sm text-foreground outline-none data-highlighted:bg-muted data-disabled:opacity-50", className)}
      {...props}
    >
      {icon ? <MenuItemIconPrimitive className="inline-flex shrink-0 items-center text-muted-foreground [&_svg]:size-4">{icon}</MenuItemIconPrimitive> : null}
      <span className="flex-1">{children}</span>
      {trailing}
    </MenuItemPrimitive>
  );
}

function MenuGroupLabel({ className, ...props }: ComponentProps<typeof MenuGroupLabelPrimitive>) {
  return <MenuGroupLabelPrimitive className={cn("px-2 pt-2 pb-1 font-mono text-[0.65rem] tracking-[0.15em] text-muted-foreground uppercase", className)} {...props} />;
}

function MenuSeparator({ className, ...props }: ComponentProps<typeof MenuSeparatorPrimitive>) {
  return <MenuSeparatorPrimitive className={cn("my-1 h-px bg-border", className)} {...props} />;
}

export { Menu, MenuContent, MenuGroup, MenuGroupLabel, MenuItem, MenuSeparator, MenuTrigger };
