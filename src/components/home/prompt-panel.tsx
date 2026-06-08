import { useRef, useState } from "react"

import {
  AlignLeftIcon,
  ArrowUpIcon,
  BarChart2Icon,
  CreditCardIcon,
  EyeIcon,
  EyeOffIcon,
  GitBranchIcon,
  GripVerticalIcon,
  HelpCircleIcon,
  ImageIcon,
  SparklesIcon,
  TableIcon,
  TerminalIcon,
  TypeIcon,
  WorkflowIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

// ── Layer types ──────────────────────────────────────────────────────────────

const LAYER_ICONS = {
  text: TypeIcon,
  table: TableIcon,
  mindmap: GitBranchIcon,
  flashcard: CreditCardIcon,
  quiz: HelpCircleIcon,
  chart: BarChart2Icon,
  code: TerminalIcon,
  diagram: WorkflowIcon,
  outline: AlignLeftIcon,
  image: ImageIcon,
} as const

type LayerType = keyof typeof LAYER_ICONS

interface Layer {
  id: string
  type: LayerType
  label: string
  visible: boolean
}

const PLACEHOLDER_LAYERS: Layer[] = [
  { id: "1", type: "text", label: "Introduction", visible: true },
  { id: "2", type: "table", label: "Comparison Table", visible: true },
  { id: "3", type: "chart", label: "Growth Chart", visible: true },
  { id: "4", type: "code", label: "Code Snippet", visible: false },
  { id: "5", type: "mindmap", label: "Concept Map", visible: true },
]

const LAYER_COLORS: Record<LayerType, string> = {
  text: "text-slate-500 bg-slate-500/10",
  table: "text-blue-500 bg-blue-500/10",
  mindmap: "text-violet-500 bg-violet-500/10",
  flashcard: "text-emerald-500 bg-emerald-500/10",
  quiz: "text-amber-500 bg-amber-500/10",
  chart: "text-green-500 bg-green-500/10",
  code: "text-slate-500 bg-slate-500/10",
  diagram: "text-rose-500 bg-rose-500/10",
  outline: "text-cyan-500 bg-cyan-500/10",
  image: "text-pink-500 bg-pink-500/10",
}

// ── Format chips ─────────────────────────────────────────────────────────────

const FORMAT_CHIPS = [
  { key: "auto", label: "Auto" },
  { key: "table", label: "Table" },
  { key: "mindmap", label: "Mind Map" },
  { key: "flashcard_deck", label: "Flashcards" },
  { key: "quiz", label: "Quiz" },
  { key: "outline", label: "Outline" },
] as const

type FormatKey = (typeof FORMAT_CHIPS)[number]["key"]

// ── Component ─────────────────────────────────────────────────────────────────

export function PromptPanel() {
  const [prompt, setPrompt] = useState("")
  const [selectedFormat, setSelectedFormat] = useState<FormatKey>("auto")
  const [layers, setLayers] = useState<Layer[]>(PLACEHOLDER_LAYERS)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const toggleVisibility = (id: string) =>
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)),
    )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
    }
  }

  return (
    <Sidebar side="right" collapsible="offcanvas">
      {/* ── Header ── */}
      <SidebarHeader className="border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <SparklesIcon className="size-3.5 text-primary" />
          <span className="text-sm font-semibold">Copilot</span>
        </div>
      </SidebarHeader>

      {/* ── Layers panel ── */}
      <SidebarContent className="p-0">
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Layers
          </span>
          <span className="text-[10px] text-muted-foreground">
            {layers.filter((l) => l.visible).length}/{layers.length} visible
          </span>
        </div>
        <Separator />
        <ScrollArea className="h-full">
          {layers.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
              <p className="text-xs text-muted-foreground">No layers yet.</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Generate content to see layers here.
              </p>
            </div>
          ) : (
            <div className="py-1">
              {layers.map((layer) => {
                const Icon = LAYER_ICONS[layer.type]
                const colorClass = LAYER_COLORS[layer.type]
                return (
                  <div
                    key={layer.id}
                    className={cn(
                      "group flex items-center gap-2.5 px-3 py-2 transition-colors hover:bg-muted/50",
                      !layer.visible && "opacity-40",
                    )}
                  >
                    <GripVerticalIcon className="size-3 shrink-0 cursor-grab text-muted-foreground opacity-0 group-hover:opacity-100" />
                    <span
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded",
                        colorClass,
                      )}
                    >
                      <Icon className="size-3" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs">{layer.label}</p>
                      <p className="text-[10px] capitalize text-muted-foreground">
                        {layer.type}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleVisibility(layer.id)}
                      className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                    >
                      {layer.visible ? (
                        <EyeIcon className="size-3.5" />
                      ) : (
                        <EyeOffIcon className="size-3.5" />
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </SidebarContent>

      {/* ── Prompt input ── */}
      <SidebarFooter className="p-0">
        <Separator />
        <div className="px-3 py-3">
          <div className="rounded-xl border bg-muted/20 transition-all focus-within:border-ring/60 focus-within:ring-2 focus-within:ring-ring/20">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe what to generate…"
              rows={3}
              className="w-full resize-none bg-transparent px-3 pb-1 pt-3 text-xs placeholder:text-muted-foreground focus:outline-none"
            />
            <div className="flex items-center justify-between px-2 pb-2">
              <div className="flex flex-wrap gap-1">
                {FORMAT_CHIPS.map((chip) => (
                  <button
                    key={chip.key}
                    onClick={() => setSelectedFormat(chip.key)}
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] transition-colors",
                      selectedFormat === chip.key
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
              <Button size="icon-sm" disabled={!prompt.trim()}>
                <ArrowUpIcon />
              </Button>
            </div>
          </div>
          <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
            <kbd className="font-mono">Enter</kbd> to generate ·{" "}
            <kbd className="font-mono">Shift+Enter</kbd> new line
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
