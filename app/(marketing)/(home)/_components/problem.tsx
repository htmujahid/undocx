import Link from "next/link";
import { Section } from "../../_components/frame";

export function Problem({ number }: { number: string }) {
  return (
    <Section id="problem" number={number} label="The problem" note="Three complaints." title="Three reasons the last tool got abandoned." description="Undocx is not a faster way to get more text. It is a way to keep control of a draft you did not type." tone="muted">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Complaint n="1" quote="It sounded like anyone." href="/features#your-voice" label="Your voice">
          Undocx learns your voice from three documents you already wrote, and follows rules you set once.
        </Complaint>
        <Complaint n="2" quote="Fixing one sentence meant regenerating everything." href="/features#section-regenerate" label="Section regenerate">
          Rewrite one paragraph with one instruction. Lock what is final. Nothing else moves.
        </Complaint>
        <Complaint n="3" quote="The numbers came from nowhere." href="/features#grounded-writing" label="Grounded writing">
          Attach the spreadsheet and the notes. Every figure carries a citation that opens the source.
        </Complaint>
      </div>
    </Section>
  );
}

function Complaint({ n, quote, href, label, children }: { n: string; quote: string; href: string; label: string; children: React.ReactNode }) {
  return (
    <article className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6">
      <span aria-hidden="true" className="font-serif text-5xl leading-none text-primary">
        {n}
      </span>
      <blockquote className="m-0 font-serif text-2xl leading-tight text-foreground">“{quote}”</blockquote>
      <p className="m-0 grow text-base leading-normal text-muted-foreground">{children}</p>
      <Link href={href} className="font-medium text-foreground underline decoration-border underline-offset-[0.3em] hover:text-primary-deep hover:decoration-primary">
        {label} →
      </Link>
    </article>
  );
}
