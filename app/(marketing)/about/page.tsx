import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"

const VALUES = [
  {
    title: "Format follows intent",
    body: "The format of an answer should serve the question, not the other way around. We built Undocx to pick the layout that makes information clearest, not the one that's easiest to generate.",
  },
  {
    title: "Your knowledge base, not ours",
    body: "Everything you generate belongs to you. We don't train on your content, sell your data, or lock you into a walled garden. Export anything, anytime.",
  },
  {
    title: "Honest about what AI can do",
    body: "AI is genuinely useful for a lot of things and genuinely bad at others. We try to build for the former and stay out of the way on the latter.",
  },
]

const CAPABILITIES = [
  {
    title: "Structured generation",
    body: "Documents composed from tables, code, diagrams, callouts, math, and citations, not flat text.",
  },
  {
    title: "AI inline editing",
    body: "Select any part of a document and rewrite just that range, with an accept-or-reject preview.",
  },
  {
    title: "Chat with your documents",
    body: "Ask questions across your knowledge base and get answers grounded in your own sources, with citations.",
  },
  {
    title: "Organized knowledge base",
    body: "Nested folders, color-coded collections, favorites, archive, and a ⌘K command palette.",
  },
  {
    title: "Team collaboration",
    body: "Multiple workspaces, email invitations, editor and viewer roles, and per-document sharing.",
  },
  {
    title: "Public links & export",
    body: "Publish read-only links anyone can open, and export any document to Markdown anytime.",
  },
]

const MILESTONES = [
  {
    year: "2024",
    label: "Founded",
    detail:
      "Started with a simple frustration: AI always answered in walls of text.",
  },
  {
    year: "2025 Q1",
    label: "Private beta",
    detail: "First 500 users helped us learn which formats mattered most.",
  },
  {
    year: "2025 Q3",
    label: "Early access",
    detail:
      "Opened to the public with structured generation and a searchable knowledge base.",
  },
  {
    year: "Now",
    label: "Building",
    detail:
      "Shipping team collaboration, document chat with citations, and a richer editing experience.",
  },
]

export const metadata = {
  title: "About",
  description:
    "Learn about Undocx's mission to make AI-generated content adaptive, organized, and editable.",
}

export default function AboutPage() {
  return (
    <main>
      <section className="border-b border-border/40">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center lg:py-32">
          <p className="mb-4 text-sm font-medium text-muted-foreground">
            About Undocx
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Information should arrive in the shape it needs to be
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            We built Undocx because the way AI responds matters as much as
            what it says. A step-by-step process deserves a numbered list, not a
            paragraph. A comparison deserves a table, not a sentence.
          </p>
        </div>
      </section>

      <section className="border-b border-border/40">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                What we&apos;re building
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Undocx is an intelligent content generation and knowledge
                management platform. When you give it a prompt, the AI writes a
                structured document, composing tables, code, diagrams,
                callouts, math, and footnoted citations into whatever mix the
                topic actually needs.
              </p>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Every response is saved to a knowledge base you can organize,
                search, edit with AI, share with a team, and ask questions
                across. Think of it as a second brain that speaks your language
                and remembers everything.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Why it matters
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Most AI tools treat every question the same way: return text,
                let the user figure out the rest. That creates cognitive
                overhead, you still have to restructure the response before
                it&apos;s useful.
              </p>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                We believe AI should do that work for you. The format is part of
                the answer. Getting it right makes information immediately
                usable instead of something you have to process first.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border/40">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-2xl font-semibold tracking-tight">
            What&apos;s inside
          </h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
            Undocx is one place to generate, refine, organize, and share
            structured knowledge. Here&apos;s what you get.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map((c) => (
              <div key={c.title}>
                <h3 className="flex items-center gap-2 font-semibold">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-4 shrink-0 text-primary"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {c.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {c.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border/40">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="mb-12 text-2xl font-semibold tracking-tight">
            What we believe
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {VALUES.map((v) => (
              <div key={v.title}>
                <h3 className="font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border/40">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="mb-12 text-2xl font-semibold tracking-tight">
            How we got here
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {MILESTONES.map((m) => (
              <div key={m.year} className="rounded-xl border bg-muted/20 p-5">
                <p className="text-xs font-medium text-muted-foreground">
                  {m.year}
                </p>
                <p className="mt-1 font-semibold">{m.label}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {m.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            Try it for free
          </h2>
          <p className="mt-3 text-muted-foreground">
            No credit card required. See what adaptive AI content looks like for
            your own questions.
          </p>
          <div className="mt-8">
            <Link
              href="/auth/sign-up"
              className={buttonVariants({ size: "lg" })}
            >
              Get started free
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
