import { Section } from "../../_components/frame";

export function Promises({ number }: { number: string }) {
  return (
    <Section id="promises" number={number} label="On both plans" note="Three promises." title="What holds whichever plan you are on." tone="muted">
      <dl className="m-0 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {[
          ["Your documents stay yours", "Export at any point, in any format. Delete and they are gone from backups within 30 days."],
          ["One person per document", "Each document belongs to one account. A team plan with shared documents, voices and rules comes later."],
          ["Notice before any change", "If the price or the Free allowance ever changes, you hear about it first."],
        ].map(([term, detail]) => (
          <div key={term} className="rounded-lg border border-border bg-card p-5">
            <dt className="m-0 font-serif text-xl text-foreground">{term}</dt>
            <dd className="m-0 mt-2 text-base leading-normal text-muted-foreground">{detail}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
