"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const QUESTIONS = [
  {
    q: "How does the AI decide how to structure a response?",
    a: "It reads the intent of your prompt and composes the document from the blocks that fit: tables for comparisons and data, fenced code for anything technical, SVG figures for charts and diagrams, callouts for key points, math for formulas, and footnotes for references. You don't pick a format; the model builds the right mix for the topic.",
  },
  {
    q: "Can I edit specific parts of the output?",
    a: "Yes. Select any portion of a document (a sentence, a table row, a paragraph) and tell the AI what to change in plain language. It rewrites just that range and shows the proposed change inline, so you can accept or reject it before anything is saved. The rest of the document stays untouched.",
  },
  {
    q: "Is my generated content saved automatically?",
    a: "Everything you generate is saved to your knowledge base as a document you own. Organize it with nested folders and color-coded collections, star favorites, archive what you're done with, and jump to anything instantly with the ⌘K command palette.",
  },
  {
    q: "Can I ask questions about my own documents?",
    a: "Yes. Undocx can chat across your knowledge base, it searches your documents semantically and answers with inline citations, so you can trace every claim back to the source it came from.",
  },
  {
    q: "Can I collaborate with a team?",
    a: "Yes. Create multiple workspaces and invite teammates by email as editors or viewers. You can share an entire workspace or just a single document, and roles control exactly who can edit versus view.",
  },
  {
    q: "Can I share something publicly?",
    a: "Yes. Turn on public access for any document to get a read-only link that anyone can open (no account or sign-in required). Turn it off anytime to make it private again.",
  },
  {
    q: "How do you handle my data and security?",
    a: "Your content is yours, we don't use it to train AI models or share it with other users. Sign in with email and password or with Google, secure your account with two-factor authentication, and export any document to Markdown whenever you want.",
  },
  {
    q: "How is this different from ChatGPT or other AI tools?",
    a: "Most AI tools return text and forget it. Undocx treats every response as a structured document, keeps it in an organized knowledge base you can search and share, lets you edit it with AI, and lets you ask questions back across everything you've saved.",
  },
  {
    q: "Is there a free plan?",
    a: "Undocx is in early access and free to use while we finalize pricing. Sign up now to get in and be the first to know about launch details.",
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
