"use client";

import {
  Drawer,
  DrawerBackdrop as DrawerBackdropPrimitive,
  DrawerClose,
  DrawerContent as DrawerContentPrimitive,
  DrawerDescription,
  DrawerTitle as DrawerTitlePrimitive,
  DrawerTrigger,
} from "@ui-sdk/react/drawer";
import type { ComponentProps } from "react";
import { cn } from "~@/lib/utils";

function DrawerBackdrop({ className, ...props }: ComponentProps<typeof DrawerBackdropPrimitive>) {
  return <DrawerBackdropPrimitive className={cn("fixed inset-0 bg-foreground/50", className)} {...props} />;
}

function DrawerContent({ className, ...props }: ComponentProps<typeof DrawerContentPrimitive>) {
  return (
    <DrawerContentPrimitive
      className={cn(
        "flex h-full w-[min(20rem,85vw)] flex-col bg-background text-foreground outline-none data-[side=left]:border-r data-[side=right]:border-l data-[side=bottom]:h-auto data-[side=bottom]:w-full data-[side=bottom]:border-t",
        className,
      )}
      {...props}
    />
  );
}

function DrawerTitle({ className, ...props }: ComponentProps<typeof DrawerTitlePrimitive>) {
  return <DrawerTitlePrimitive className={cn("font-serif text-2xl font-medium tracking-tight", className)} {...props} />;
}

export { Drawer, DrawerBackdrop, DrawerClose, DrawerContent, DrawerDescription, DrawerTitle, DrawerTrigger };
