import Link from "next/link";
import { Button } from "~@/components/ui/button";
import { CheckIcon } from "~@/components/ui/icons";
import { Section } from "../../_components/frame";
import { startHref } from "../../_components/links";

const free = ["Brief, outline and draft", "Section regenerate, locks, variations and notes to self", "Export to Word, PDF, Markdown and Google Docs", "Five documents", "A monthly allowance of AI writing. When it runs out, the AI stops and you can keep typing."];
const pro = ["Everything in Free, with unlimited documents", "No monthly limit on AI writing", "Your voice, learned from your samples", "Grounded writing with citations", "House rules, review links and version history", "Claims check and document types, as they ship"];

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
    <Section id="plans" number={number} label="Plans" note="Free, or $10 a month." title="Two plans. One of them is free." description="Start on Free. Move to Pro when you need unlimited documents, your voice and sources.">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Plan name="Free" price="$0" period="forever" who="Anyone who writes now and then" items={free} isPro={false} />
        <Plan name="Pro" price="$10" period="per month" who="People who write every week" items={pro} isPro />
      </div>
    </Section>
  );
}
