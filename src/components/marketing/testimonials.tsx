const TESTIMONIALS = [
  {
    quote:
      "I asked it to explain a complex topic and it gave me a mind map. That's exactly the kind of thing I needed for studying — not another wall of text.",
    name: "Priya M.",
    role: "Graduate student",
  },
  {
    quote:
      "When I ask for a process, I get a flowchart. When I ask for a comparison, I get a table. It reads what you actually need.",
    name: "David L.",
    role: "Product manager",
  },
  {
    quote:
      "The selection editing is the killer feature. Highlight one sentence, rewrite just that, and the rest stays intact.",
    name: "Sarah K.",
    role: "Content strategist",
  },
  {
    quote:
      "A knowledge base that actually persists means I stop re-generating the same content. Everything just accumulates over time.",
    name: "James R.",
    role: "Team lead",
  },
  {
    quote:
      "The folder and tag system makes it feel like a real tool, not just a chat window I'll lose next week.",
    name: "Amira H.",
    role: "Research analyst",
  },
  {
    quote:
      "Already more useful than asking any other AI to 'format this as a table'. Tarteeb just does it without being asked.",
    name: "Marcus T.",
    role: "Software engineer",
  },
]

function Stars() {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="size-3.5 text-foreground"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export function Testimonials() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Testimonials
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            What people are saying
          </h2>
          <p className="mt-4 text-muted-foreground">
            Feedback from early users after their first sessions.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col justify-between rounded-2xl border border-border bg-card p-8"
            >
              <div className="space-y-4">
                <Stars />
                <blockquote className="text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
              </div>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-6">
                <div className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
