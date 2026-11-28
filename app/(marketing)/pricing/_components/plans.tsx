import Link from "next/link";
import { Button } from "~@/components/ui/button";
import { CheckIcon } from "~@/components/ui/icons";
import { Section } from "../../_components/frame";
import { startHref } from "../../_components/links";

const free = [
  "Brief chat, outline when needed, and a first draft",
  "Section regenerate, locks, variations and notes to self",
  "Export to Word, OpenDocument, PDF and JSON",
  "5 documents, with the last 3 versions of each",
  "A monthly AI allowance, about two assisted documents. It resets on the 1st of each month",
  "1 writer profile, 1 voice and 1 rule set, and 10 sources",
];
const pro = [
  "Everything in Free, with far more room",
  "100 documents, with the last 10 versions of each",
  "A larger AI allowance, about 13 assisted documents, resetting with your billing date",
  "The strongest model for first drafts and claims checks",
  "10 profiles, 10 voices, 10 rule sets and 100 sources, with files up to 10 MB",
  "Longer documents and sources for the assistant to read",
];

function Plan({ name, price, period, who, items, isPro }: { name: string; price: string; period: string; who: string; items: string[]; isPro: boolean }) {
  return (
    <article aria-labelledby={`plan-${name}`} className={"flex min-w-0 flex-col gap-5 rounded-lg border p-6 " + (isPro ? "border-primary bg-card" : "border-border bg-card")}>
      <div>
        <h3 id={`plan-${name}`} className="m-0 font-serif text-2xl font-medium text-foreground">
          {name}
        </h3>
        <p className="m-0 mt-1 text-sm text-muted-foreground">{who}</p>
      </div>
      <p className="m-0">
        <span className={"font-serif text-6xl leading-none " + (isPro ? "text-primary" : "text-foreground")}>{price}</span>
        <span className="ml-2 text-sm text-muted-foreground">{period}</span>
      </p>
      <ul className="m-0 grid grow list-none gap-y-2 p-0 text-sm text-foreground">
        {items.map((item) => (
          <li key={item} className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-2">
            <CheckIcon className={"size-3 translate-y-px " + (isPro ? "text-primary" : "text-muted-foreground")} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <div>
        <Button variant={isPro ? "secondary" : "primary"} render={<Link href={startHref} />}>
          {isPro ? "Start with Pro" : "Start writing free"}
        </Button>
      </div>
    </article>
  );
}

export function Plans({ number }: { number: string }) {
  return (
    <Section id="plans" number={number} label="Plans" note="Free, or $10 a month." title="Two plans. One of them is free." description="Start on Free. Move to Pro when you need more documents, a larger AI allowance and a bigger library.">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Plan name="Free" price="$0" period="forever" who="Anyone who writes now and then" items={free} isPro={false} />
        <Plan name="Pro" price="$10" period="per month" who="People who write every week" items={pro} isPro />
      </div>
    </Section>
  );
}
