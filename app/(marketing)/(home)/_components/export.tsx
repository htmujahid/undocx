import { CheckIcon } from "~@/components/ui/icons";
import { Section } from "../../_components/frame";
import { MoreLink } from "../../_components/more-link";

const formats = [
  { name: "Word", ext: ".docx", note: "Citations become footnotes. Headings, lists and tables intact." },
  { name: "PDF", ext: ".pdf", note: "Page numbers and a sources list. For what should not change." },
  { name: "Markdown", ext: ".md", note: "Plain headings and numbered links." },
  { name: "OpenDocument", ext: ".odt", note: "For LibreOffice and other open office suites." },
];

export function Export({ number }: { number: string }) {
  return (
    <Section
      id="export"
      number={number}
      label="Export"
      note="Four formats."
      title="It leaves as an ordinary file."
      description={
        <>
          Locks and citations become plain formatting, so nobody downstream needs Undocx to read what you wrote. <MoreLink href="/features#export">Export options</MoreLink>
        </>
      }
    >
      <ul className="m-0 grid list-none grid-cols-2 gap-4 p-0 lg:grid-cols-4">
        {formats.map((format, index) => (
          <li key={format.name} className={"flex flex-col gap-2 rounded-lg border p-5 " + (index === 0 ? "border-primary bg-card" : "border-border bg-card")}>
            <span className="flex items-baseline justify-between">
              <span className="font-serif text-2xl text-foreground">{format.name}</span>
              {index === 0 ? <CheckIcon className="size-4 text-primary" /> : null}
            </span>
            <span className="font-mono text-xs text-muted-foreground">{format.ext}</span>
            <span className="text-sm leading-normal text-muted-foreground">{format.note}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
