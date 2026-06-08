const STEPS = [
  {
    step: "01",
    title: "Ask anything",
    description:
      "Type your question, topic, or task naturally. No special syntax, no format flags, no prompt engineering required.",
  },
  {
    step: "02",
    title: "The AI picks the right format",
    description:
      "Tarteeb analyzes your query's intent and responds in the layout that best serves it: a flowchart, table, timeline, or guide.",
  },
  {
    step: "03",
    title: "Organize and refine",
    description:
      "Save to your knowledge base, edit any section inline with AI, and convert between formats as your needs evolve.",
  },
]

export function HowItWorks() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            From query to knowledge base
          </h2>
          <p className="mt-4 text-muted-foreground">
            Three steps. No configuration. No prompt engineering.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.step} className="relative">
              <p className="font-mono text-6xl font-bold text-muted-foreground/10 leading-none select-none">
                {step.step}
              </p>
              <div className="mt-4 space-y-2">
                <h3 className="text-base font-semibold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
