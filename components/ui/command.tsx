"use client";

import {
  Command,
  CommandEmpty as CommandEmptyPrimitive,
  CommandGroup,
  CommandGroupLabel as CommandGroupLabelPrimitive,
  CommandInput as CommandInputPrimitive,
  CommandItem as CommandItemPrimitive,
  CommandItemIcon as CommandItemIconPrimitive,
  CommandList as CommandListPrimitive,
  CommandSeparator as CommandSeparatorPrimitive,
  CommandShortcut as CommandShortcutPrimitive,
} from "@ui-sdk/react/command";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "~@/lib/utils";

function CommandInput({ className, ...props }: ComponentProps<typeof CommandInputPrimitive>) {
  return (
    <CommandInputPrimitive
      className={cn("h-12 w-full border-b border-border bg-transparent px-4 text-base text-foreground outline-none placeholder:text-faint-foreground", className)}
      {...props}
    />
  );
}

function CommandList({ className, ...props }: Omit<ComponentProps<typeof CommandListPrimitive>, "children"> & { children?: ReactNode }) {
  return <CommandListPrimitive className={cn("max-h-[min(22rem,calc(100dvh-18vh-7rem))] overflow-y-auto p-2", className)} {...props} />;
}

function CommandEmpty({ className, ...props }: ComponentProps<typeof CommandEmptyPrimitive>) {
  return <CommandEmptyPrimitive className={cn("hidden px-4 py-8 text-center text-sm text-muted-foreground data-empty:block", className)} {...props} />;
}

function CommandGroupLabel({ className, ...props }: ComponentProps<typeof CommandGroupLabelPrimitive>) {
  return <CommandGroupLabelPrimitive className={cn("px-2 pt-2 pb-1 font-mono text-[0.65rem] tracking-[0.15em] text-muted-foreground uppercase", className)} {...props} />;
}

function CommandItem({ className, ...props }: Omit<ComponentProps<typeof CommandItemPrimitive>, "children"> & { children?: ReactNode }) {
  return (
    <CommandItemPrimitive
      className={cn("flex cursor-default items-center gap-3 rounded-md px-2 py-2 text-sm text-foreground outline-none data-highlighted:bg-muted", className)}
      {...props}
    />
  );
}

function CommandItemIcon({ className, ...props }: Omit<ComponentProps<typeof CommandItemIconPrimitive>, "children"> & { children?: ReactNode }) {
  return <CommandItemIconPrimitive className={cn("inline-flex size-4 shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-4", className)} {...props} />;
}

function CommandSeparator({ className, ...props }: ComponentProps<typeof CommandSeparatorPrimitive>) {
  return <CommandSeparatorPrimitive className={cn("my-1 h-px bg-border", className)} {...props} />;
}

function CommandShortcut({ className, ...props }: ComponentProps<typeof CommandShortcutPrimitive>) {
  return <CommandShortcutPrimitive className={cn("ml-auto font-sans text-xs text-muted-foreground", className)} {...props} />;
}

export { Command, CommandEmpty, CommandGroup, CommandGroupLabel, CommandInput, CommandItem, CommandItemIcon, CommandList, CommandSeparator, CommandShortcut };
