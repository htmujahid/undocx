"use client";

import { Accordion, AccordionHeader, AccordionItem, AccordionPanel, AccordionTrigger } from "~@/components/ui/accordion";
export type FaqItem = { question: string; answer: string };

export function FaqList({ items, defaultOpen }: { items: FaqItem[]; defaultOpen?: string }) {
  return (
    <Accordion defaultValue={defaultOpen ? [defaultOpen] : []} className="border-t border-border">
      {items.map((item) => (
        <AccordionItem key={item.question} value={item.question}>
          <AccordionHeader>
            <AccordionTrigger>{item.question}</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>
            <p className="m-0 max-w-measure text-base leading-relaxed text-muted-foreground">{item.answer}</p>
          </AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
