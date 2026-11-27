import { Section } from "../../_components/frame";
import { PageSetupPlayground } from "./page-setup-playground";

const facts = [
  ["Six paper sizes", "A4, Letter, Legal, Executive, Folio and B5."],
  ["Five margins", "From none to wide, set for the whole document."],
  ["Page breaks", "Start a new page exactly where you want one."],
  ["Pageless", "No edges at all. Just a long page that fills the window."],
];

export function PageSetup({ number }: { number: string }) {
  return (
    <Section id="page-setup" number={number} label="Page setup" note="Try it." title="Set up the page once. The document follows." description="Choose Pages or Pageless, a paper size, orientation and margins. The editor lays the draft out on real pages, and a block never splits across a page edge." tone="muted">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <figure aria-labelledby="page-setup-title" className="m-0 min-w-0">
          <PageSetupPlayground />
        </figure>
        <ul className="m-0 grid list-none gap-5 p-0 lg:border-l lg:border-border lg:pl-6">
          {facts.map(([term, text]) => (
            <li key={term}>
              <p className="m-0 text-sm font-medium text-foreground">{term}</p>
              <p className="m-0 mt-0.5 text-sm leading-normal text-muted-foreground">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
