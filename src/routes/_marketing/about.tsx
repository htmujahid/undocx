import { Link, createFileRoute } from "@tanstack/react-router"

import { buttonVariants } from "@/components/ui/button"

export const Route = createFileRoute("/_marketing/about")({
  component: AboutPage,
})

const VALUES = [
  {
    title: "Format follows intent",
    body: "The format of an answer should serve the question, not the other way around. We built Tarteeb AI to pick the layout that makes information clearest, not the one that's easiest to generate.",
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
    detail: "Opened to the public with six adaptive content formats.",
  },
  {
    year: "Now",
    label: "Building",
    detail: "Adding collaboration, more formats, and a richer knowledge base.",
  },
]

function AboutPage() {
  return (
    <main>
      {/* Hero */}
      <section className="border-b border-border/40">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center lg:py-32">
          <p className="mb-4 text-sm font-medium text-muted-foreground">
            About Tarteeb AI
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Information should arrive in the shape it needs to be
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            We built Tarteeb AI because the way AI responds matters as much as
            what it says. A step-by-step process deserves a numbered list, not a
            paragraph. A comparison deserves a table, not a sentence.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="border-b border-border/40">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                What we're building
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Tarteeb AI is an intelligent content generation and knowledge
                management platform. When you ask a question or give a prompt,
                our AI decides the best way to present the answer — prose,
                table, flowchart, flashcards, kanban, or a mix of several
                formats at once.
              </p>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Every response is saved to a personal knowledge base you can
                organize, search, and build on. Think of it as a second brain
                that speaks your language and remembers everything.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Why it matters
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Most AI tools treat every question the same way: return text,
                let the user figure out the rest. That creates cognitive
                overhead — you still have to restructure the response before
                it's useful.
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

      {/* Values */}
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

      {/* Timeline */}
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

      {/* CTA */}
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
            <Link to="/auth/sign-up" className={buttonVariants({ size: "lg" })}>
              Get started free
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
