"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const QUESTIONS = [
  {
    q: "How does the AI decide which format to use?",
    a: "It analyzes the intent of your query. A sequence gets a step-by-step or timeline format. A comparison gets a table. A concept gets a mind map. You don't need to specify; the model picks what fits.",
  },
  {
    q: "Can I change the format after generation?",
    a: "Yes. Any piece of content can be converted to a different layout after it's been generated. The AI reformats the existing content to fit the new structure.",
  },
  {
    q: "Is my generated content saved automatically?",
    a: "Everything you generate is stored in your personal knowledge base. Organize it with folders, tags, and collections. Search across all of it at any time.",
  },
  {
    q: "How is this different from ChatGPT or other AI tools?",
    a: "Most AI tools return text and nothing else. Renderical treats every response as a structured document and keeps it in an organized knowledge base. The focus is on both the shape of the output and what happens to it afterward.",
  },
  {
    q: "Can I edit specific parts of the output?",
    a: "Yes. Highlight any portion (a sentence, a table row, a list item) and prompt the AI to rewrite just that section, leaving everything else unchanged.",
  },
  {
    q: "Is there a free plan?",
    a: "Pricing is being finalized. Sign up now to get early access and be the first to know about launch details.",
  },
]

export function FAQ() {
  return (
    <section className="bg-muted/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            FAQ
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-muted-foreground">
            Everything you need to know before getting started.
          </p>
        </div>

        <div className="mt-16">
          <Accordion>
            {QUESTIONS.map((item, i) => (
              <AccordionItem key={i} value={String(i)}>
                <AccordionTrigger className="text-left font-medium">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">{item.a}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
