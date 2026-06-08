import { createFileRoute } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import { ArrowUpIcon } from "lucide-react"

export const Route = createFileRoute("/home/")({
  component: HomePage,
})

const EXAMPLE_PROMPTS = [
  "Explain how neural networks learn",
  "Compare SQL vs NoSQL databases",
  "Steps to deploy a Docker container",
  "Study guide for the water cycle",
]

function HomePage() {
  const { user } = Route.useRouteContext()

  const firstName = user?.name?.split(" ")[0] ?? "there"

  return (
    <main className="container mx-auto px-4 py-20">
      <div className="mx-auto max-w-2xl space-y-10">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            Good to see you, {firstName}
          </h1>
          <p className="text-sm text-muted-foreground">
            Describe anything — AI will respond in the format that fits best,
            mixing formats when needed.
          </p>
        </div>

        <div className="relative">
          <textarea
            placeholder="What do you want to know or create?"
            className="w-full resize-none rounded-xl border bg-muted/30 px-4 pb-12 pt-3.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
            rows={4}
          />
          <Button size="icon-sm" className="absolute bottom-3 right-3">
            <ArrowUpIcon />
          </Button>
        </div>

        <div className="space-y-3">
          <p className="text-center text-xs text-muted-foreground">Try asking</p>
          <div className="flex flex-wrap justify-center gap-2">
            {EXAMPLE_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                className="rounded-full border bg-background px-3.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
