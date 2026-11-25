"use client";

import {
  Accordion,
  AccordionHeader as AccordionHeaderPrimitive,
  AccordionItem as AccordionItemPrimitive,
  AccordionPanel as AccordionPanelPrimitive,
  AccordionTrigger as AccordionTriggerPrimitive,
} from "@ui-sdk/react/accordion";
import { ChevronDownIcon } from "~@/components/ui/icons";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "~@/lib/utils";

function AccordionItem({ className, ...props }: ComponentProps<typeof AccordionItemPrimitive>) {
  return <AccordionItemPrimitive className={cn("border-b border-border", className)} {...props} />;
}

function AccordionHeader({ className, ...props }: ComponentProps<typeof AccordionHeaderPrimitive>) {
  return <AccordionHeaderPrimitive className={cn("m-0", className)} {...props} />;
}

function AccordionTrigger({
  className,
  children,
  ...props
}: Omit<ComponentProps<typeof AccordionTriggerPrimitive>, "children"> & { children?: ReactNode }) {
  return (
    <AccordionTriggerPrimitive
      className={cn(
        "flex w-full items-start justify-between gap-6 py-5 text-left font-serif text-xl leading-tight text-foreground outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDownIcon
        aria-hidden="true"
        className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform duration-200 in-data-open:rotate-180 motion-reduce:transition-none"
      />
    </AccordionTriggerPrimitive>
  );
}

function AccordionPanel({
  className,
  children,
  ...props
}: Omit<ComponentProps<typeof AccordionPanelPrimitive>, "children"> & { children?: ReactNode }) {
  return (
    <AccordionPanelPrimitive
      className={cn(
        "overflow-hidden h-(--accordion-panel-height) transition-[height] duration-200 ease-out data-starting-style:h-0 data-ending-style:h-0 motion-reduce:transition-none",
        className,
      )}
      {...props}
    >
      <div className="pb-6">{children}</div>
    </AccordionPanelPrimitive>
  );
}

export { Accordion, AccordionHeader, AccordionItem, AccordionPanel, AccordionTrigger };
