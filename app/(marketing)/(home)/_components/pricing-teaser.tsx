import Link from "next/link";
import { Button } from "~@/components/ui/button";
import { Section } from "../../_components/frame";
import { startHref } from "../../_components/links";
import { MoreLink } from "../../_components/more-link";

export function PricingTeaser({ number }: { number: string }) {
  return (
    <Section
      id="pricing"
      number={number}
      label="Pricing"
      note="Free, or $10 a month."
      title="Free to start. Pro when you write every week."
      description={
        <>
          Every document is yours to export on either plan. <MoreLink href="/pricing">Compare the plans</MoreLink>
        </>
      }
      tone="accent"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-6">
          <p className="m-0 font-serif text-5xl leading-none text-foreground">
            $0<span className="ml-2 font-sans text-sm text-muted-foreground">forever</span>
          </p>
          <p className="m-0 text-base leading-normal text-muted-foreground">Five documents and a monthly allowance of AI writing. Brief, outline, draft, regenerate, locks, variations, export.</p>
          <div className="mt-auto pt-2">
            <Button variant="primary" render={<Link href={startHref} />}>
              Start writing free
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-3 rounded-lg border border-primary bg-card p-6">
          <p className="m-0 font-serif text-5xl leading-none text-primary">
            $10<span className="ml-2 font-sans text-sm text-muted-foreground">a month</span>
          </p>
          <p className="m-0 text-base leading-normal text-muted-foreground">100 documents, a larger AI allowance, the strongest model for first drafts and claims checks, and a bigger library.</p>
          <div className="mt-auto pt-2">
            <Button render={<Link href="/pricing" />}>What Pro adds</Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
