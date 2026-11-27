import { Section } from "../../_components/frame";

const columns = [
  { stage: "At launch", items: ["Brief chat and optional outline", "Section regenerate with diff and undo", "Locked text", "Variations and merge", "Your voice from samples", "Grounded writing with citations", "Export to Word, PDF, Markdown, Google Docs"] },
  { stage: "Next", items: ["House rules", "Review links and paragraph comments", "Version history", "Claims check", "Document types"] },
  { stage: "Later", items: ["A team plan: shared documents, voices and rules", "Reusable locked blocks across documents", "Letterhead and Word templates on export", "Import from Google Drive and Notion"] },
];

export function Roadmap({ number }: { number: string }) {
  return (
    <Section id="roadmap" number={number} label="Now, next, later" note="Order, not dates." title="What ships at launch, and what is being built.">
      <ol className="m-0 grid list-none grid-cols-1 gap-x-8 gap-y-8 p-0 sm:grid-cols-3">
        {columns.map((column, index) => (
          <li key={column.stage} className="min-w-0">
            <h3 className={"m-0 mb-3 flex items-baseline gap-2 border-b pb-2 font-serif text-xl font-medium " + (index === 0 ? "border-primary text-primary" : "border-input text-foreground")}>
              <span className="font-mono text-xs tracking-[0.15em]">{String(index + 1).padStart(2, "0")}</span>
              {column.stage}
            </h3>
            <ul className="m-0 grid list-none gap-y-2 p-0 text-sm text-foreground">
              {column.items.map((item) => (
                <li key={item} className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-2">
                  <span aria-hidden="true" className={index === 0 ? "text-primary" : "text-faint-foreground"}>
                    —
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </Section>
  );
}
