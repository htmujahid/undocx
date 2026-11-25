import type { ReactNode } from "react";
import { Intro, Lede, Section, Title } from "./frame";

export function LegalIntro({ label, updated, title, children }: { label: string; updated: string; title: ReactNode; children: ReactNode }) {
  return (
    <Intro label={label} tagline={`Updated ${updated}.`}>
      <div className="flex flex-col gap-6">
        <Title>{title}</Title>
        <Lede>{children}</Lede>
      </div>
    </Intro>
  );
}

export function Clause({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return (
    <Section id={`s${number}`} number={number} label="Section" title={title}>
      <div className="flex max-w-measure flex-col gap-4 text-base leading-relaxed text-muted-foreground [&>p]:m-0">{children}</div>
    </Section>
  );
}
