import { FileTextIcon, Link2Icon } from "~@/components/ui/icons";
import { SectionLabel, Sheet, SheetChrome, SheetPage } from "../../_components/doc";
import { Section } from "../../_components/frame";
import { MoreLink } from "../../_components/more-link";

function Cite({ n }: { n: number }) {
  return (
    <sup className="ml-0.5 align-super text-[0.65em] leading-none">
      <a href="#sources" aria-label={`Source ${n}`} className="inline-flex size-[1.5em] items-center justify-center rounded-sm bg-primary/10 font-medium text-primary no-underline hover:bg-primary/20">
        {n}
      </a>
    </sup>
  );
}

const sources = [
  { n: 1, title: "Sales export 2025.xlsx", detail: "Sheet 'Orders by channel', rows 2 to 14", isLink: false },
  { n: 2, title: "Shopify analytics, Jan to Dec 2025", detail: "Checkout funnel report", isLink: true },
  { n: 3, title: "Staff interview notes.docx", detail: "Page 3, Priya, Saturday till", isLink: false },
];

export function Sources({ number }: { number: string }) {
  return (
    <Section
      id="sources"
      number={number}
      label="Grounded writing"
      note="Citations that open."
      title="Every number points back to the file it came from."
      description={
        <>
          Attach spreadsheets, documents and links. Each claim carries a citation you can click. <MoreLink href="/features#grounded-writing">How sources work</MoreLink>
        </>
      }
    >
      <Sheet>
        <SheetChrome title="Proposal: a new online store for Marlow & Finch">
          <span>3 sources attached</span>
        </SheetChrome>
        <SheetPage>
          <SectionLabel number="2">What we heard</SectionLabel>
          <p className="m-0 max-w-measure">
            Last year the website took 2,614 orders, 41% of the total<Cite n={1} />. The average basket was £27.80, and 34% of started checkouts were abandoned<Cite n={2} />, most of them at the account-creation step<Cite n={2} />. Staff estimate that one in five phone orders is a customer who gave up online<Cite n={3} />.
          </p>
          <ol id="sources" aria-label="Sources" className="m-0 mt-5 grid max-w-measure list-none gap-y-2 border-t border-border p-0 pt-4 text-sm text-muted-foreground">
            {sources.map((source) => (
              <li key={source.n} className="grid grid-cols-[1.5rem_minmax(0,1fr)] items-baseline gap-x-2">
                <span className="font-medium tabular-nums text-primary">{source.n}</span>
                <span>
                  <span className="inline-flex items-center gap-1 font-medium text-foreground">
                    {source.isLink ? <Link2Icon className="size-3" /> : <FileTextIcon className="size-3" />}
                    {source.title}
                  </span>
                  {" · "}
                  {source.detail}
                </span>
              </li>
            ))}
          </ol>
        </SheetPage>
      </Sheet>
    </Section>
  );
}
