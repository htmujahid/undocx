import { CodeIcon, DownloadIcon, FileTextIcon } from "~@/components/ui/icons";
import { Section } from "../../_components/frame";
import { ExportPlayground } from "./export-playground";

const formats = [
  { term: "Word and Docs", text: "Citations as footnotes. Headings and tables intact.", Icon: FileTextIcon },
  { term: "PDF", text: "Page numbers and a sources list.", Icon: DownloadIcon },
  { term: "Markdown", text: "Plain headings, numbered links.", Icon: CodeIcon },
];

export function Export({ number }: { number: string }) {
  return (
    <Section id="export" number={number} label="Export" note="Four formats." title="Word, PDF, Markdown or Google Docs. Nothing else to clean up." description="Pick a format and see how citations and locked text come out the other side.">
      <div className="flex flex-col gap-8">
        <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-3">
          {formats.map(({ term, text, Icon }) => (
            <li key={term} className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
              <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
              <span className="grid gap-1">
                <span className="text-base font-medium text-foreground">{term}</span>
                <span className="text-sm leading-normal text-muted-foreground">{text}</span>
              </span>
            </li>
          ))}
        </ul>
        <figure aria-labelledby="export-title" className="m-0 min-w-0">
          <ExportPlayground />
        </figure>
      </div>
    </Section>
  );
}
