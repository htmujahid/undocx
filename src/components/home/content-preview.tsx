import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

// ── Text block ────────────────────────────────────────────────────────────────

function TextBlock() {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-semibold">Introduction</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Machine learning is a subset of artificial intelligence that enables
        systems to learn and improve from experience without being explicitly
        programmed. It focuses on developing programs that can access data and
        use it to learn for themselves.
      </p>
      <p className="text-sm leading-relaxed text-muted-foreground">
        The process begins with observations or data — examples, direct
        experience, or instruction — so that computers can look for patterns in
        data and make better decisions in the future.
      </p>
    </section>
  )
}

// ── Table block ───────────────────────────────────────────────────────────────

const TABLE_DATA = {
  headers: ["Algorithm", "Type", "Use Case", "Complexity"],
  rows: [
    ["Linear Regression", "Supervised", "Prediction", "Low"],
    ["Decision Tree", "Supervised", "Classification", "Medium"],
    ["K-Means", "Unsupervised", "Clustering", "Low"],
    ["Neural Network", "Supervised", "Deep learning", "High"],
    ["Random Forest", "Ensemble", "Classification", "Medium"],
  ],
}

function TableBlock() {
  return (
    <section className="space-y-2">
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted/50">
              {TABLE_DATA.headers.map((h) => (
                <th
                  key={h}
                  className="px-3 py-2 text-left font-semibold text-foreground"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TABLE_DATA.rows.map((row, i) => (
              <tr
                key={i}
                className="border-t transition-colors hover:bg-muted/30"
              >
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className={`px-3 py-2 ${j === 0 ? "font-medium" : "text-muted-foreground"}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

// ── Chart block ───────────────────────────────────────────────────────────────

const CHART_DATA = [
  { label: "2020", value: 42, color: "bg-green-400" },
  { label: "2021", value: 61, color: "bg-green-500" },
  { label: "2022", value: 75, color: "bg-green-500" },
  { label: "2023", value: 88, color: "bg-green-600" },
  { label: "2024", value: 94, color: "bg-green-600" },
]

function ChartBlock() {
  const max = Math.max(...CHART_DATA.map((d) => d.value))
  return (
    <section className="space-y-2">
      <div className="rounded-lg border p-4">
        <p className="mb-4 text-xs font-medium">ML Adoption Rate (%)</p>
        <div className="flex items-end gap-3">
          {CHART_DATA.map((d) => (
            <div
              key={d.label}
              className="flex flex-1 flex-col items-center gap-1.5"
            >
              <span className="text-[10px] font-medium text-muted-foreground">
                {d.value}
              </span>
              <div
                className={`w-full rounded-t-sm ${d.color} transition-all`}
                style={{ height: `${(d.value / max) * 80}px` }}
              />
              <span className="text-[10px] text-muted-foreground">
                {d.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Code block ────────────────────────────────────────────────────────────────

const CODE = `import numpy as np
from sklearn.linear_model import LinearRegression

# Sample training data
X = np.array([[1], [2], [3], [4], [5]])
y = np.array([2.1, 3.9, 6.2, 7.8, 10.1])

model = LinearRegression()
model.fit(X, y)

print(f"Coefficient: {model.coef_[0]:.2f}")
print(f"Intercept:   {model.intercept_:.2f}")`

function CodeBlock() {
  return (
    <section className="space-y-2">
      <div className="overflow-hidden rounded-lg border bg-muted/30">
        <div className="flex items-center justify-between border-b bg-muted/50 px-3 py-1.5">
          <span className="text-[10px] font-medium text-muted-foreground">
            python
          </span>
          <div className="flex gap-1.5">
            <span className="size-2 rounded-full bg-red-400/70" />
            <span className="size-2 rounded-full bg-yellow-400/70" />
            <span className="size-2 rounded-full bg-green-400/70" />
          </div>
        </div>
        <pre className="overflow-x-auto px-4 py-3 text-[11px] leading-relaxed text-foreground">
          <code>{CODE}</code>
        </pre>
      </div>
    </section>
  )
}

// ── Mind map block ────────────────────────────────────────────────────────────

const MINDMAP_NODES = [
  {
    label: "Machine Learning",
    children: ["Supervised", "Unsupervised", "Reinforcement"],
  },
]

const BRANCH_COLORS = [
  "border-violet-400 text-violet-600 bg-violet-500/10",
  "border-blue-400 text-blue-600 bg-blue-500/10",
  "border-pink-400 text-pink-600 bg-pink-500/10",
]

function MindMapBlock() {
  return (
    <section className="space-y-2">
      <div className="rounded-lg border p-4">
        <div className="flex flex-col items-center gap-4">
          {/* Root */}
          <div className="rounded-full border-2 border-violet-400 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-700">
            {MINDMAP_NODES[0].label}
          </div>
          {/* Connector */}
          <div className="h-4 w-px bg-border" />
          {/* Children */}
          <div className="flex gap-6">
            {MINDMAP_NODES[0].children.map((child, i) => (
              <div key={child} className="flex flex-col items-center gap-2">
                <div className="h-4 w-px bg-border" />
                <div
                  className={`rounded-full border px-3 py-1 text-[11px] font-medium ${BRANCH_COLORS[i]}`}
                >
                  {child}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export function ContentPreview() {
  return (
    <div className="flex-1 min-h-0 overflow-hidden">
      <ScrollArea className="h-full">
        <div className="mx-auto max-w-2xl px-8 py-8">
          {/* Document header */}
          <div className="mb-6">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Generated document
            </p>
            <h1 className="text-2xl font-bold tracking-tight">
              Introduction to Machine Learning
            </h1>
            <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
              <span>5 layers</span>
              <span>·</span>
              <span>~420 words</span>
              <span>·</span>
              <span>Just now</span>
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Content layers */}
          <div className="space-y-8">
            <TextBlock />
            <TableBlock />
            <ChartBlock />
            <CodeBlock />
            <MindMapBlock />
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
