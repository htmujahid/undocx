import { useRef, useState } from "react"

import { ArrowUpIcon, SparklesIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

const EXAMPLE_PROMPTS = [
  "Explain how neural networks learn",
  "Compare SQL vs NoSQL databases",
  "Steps to deploy a Docker container",
  "Study guide for the water cycle",
  "Timeline of the French Revolution",
]

const FORMAT_CHIPS = [
  { key: "auto", label: "Auto" },
  { key: "table", label: "Table" },
  { key: "mindmap", label: "Mind Map" },
  { key: "flashcard_deck", label: "Flashcards" },
  { key: "quiz", label: "Quiz" },
  { key: "outline", label: "Outline" },
] as const

type FormatKey = (typeof FORMAT_CHIPS)[number]["key"]

export function PromptBar() {
  const [prompt, setPrompt] = useState("")
  const [selectedFormat, setSelectedFormat] = useState<FormatKey>("auto")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      // TODO: trigger generation
    }
  }

  const handleExampleClick = (text: string) => {
    setPrompt(text)
    textareaRef.current?.focus()
  }

  return (
    <div className="border-t bg-background px-4 py-3">
      {/* Example prompts */}
      <div className="mb-2.5 flex flex-wrap gap-1.5">
        {EXAMPLE_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => handleExampleClick(p)}
            className="rounded-full border bg-muted/30 px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input box */}
      <div className="rounded-xl border bg-muted/20 focus-within:border-ring/60 focus-within:ring-2 focus-within:ring-ring/20 transition-all">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe anything — the AI will respond in the best format…"
          rows={3}
          className="w-full resize-none bg-transparent px-4 pt-3.5 pb-1 text-sm placeholder:text-muted-foreground focus:outline-none"
        />

        <div className="flex items-center justify-between px-3 pb-2.5">
          {/* Format selector */}
          <div className="flex items-center gap-1">
            <SparklesIcon className="size-3.5 text-muted-foreground" />
            <div className="flex gap-1">
              {FORMAT_CHIPS.map((chip) => (
                <button
                  key={chip.key}
                  onClick={() => setSelectedFormat(chip.key)}
                  className={`rounded-full px-2.5 py-0.5 text-xs transition-colors ${
                    selectedFormat === chip.key
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <Button size="icon-sm" disabled={!prompt.trim()}>
            <ArrowUpIcon />
          </Button>
        </div>
      </div>

      <p className="mt-2 text-center text-[10px] text-muted-foreground">
        Press <kbd className="font-mono">Enter</kbd> to generate ·{" "}
        <kbd className="font-mono">Shift+Enter</kbd> for new line
      </p>
    </div>
  )
}
