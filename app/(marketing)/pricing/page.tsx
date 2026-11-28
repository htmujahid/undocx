import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "~@/components/ui/button";
import { Cta } from "../_components/cta";
import { Intro, Lede, Title } from "../_components/frame";
import { startHref } from "../_components/links";
import { Plans } from "./_components/plans";
import { Promises } from "./_components/promises";
import { Questions } from "./_components/questions";
import { Roadmap } from "./_components/roadmap";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Free for five documents and a monthly AI allowance. Pro at $10 a month for 100 documents, a larger allowance and a bigger library.",
};

export default function PricingPage() {
  return (
    <>
      <Intro label="Pricing" tagline="Free, or $10 a month.">
        <div className="flex flex-col gap-6">
          <Title>
            Free to start. <span className="text-primary italic">Pro when you write every week.</span>
          </Title>
          <Lede>Five documents and a monthly allowance of AI writing cost nothing. A hundred documents, a larger allowance and a bigger library are $10 a month.</Lede>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary" size="lg" render={<Link href={startHref} />}>
              Start writing free
            </Button>
            <span className="text-sm text-muted-foreground">No card for Free. Export anytime.</span>
          </div>
        </div>
      </Intro>
      <Plans number="01" />
      <Promises number="02" />
      <Roadmap number="03" />
      <Questions number="04" />
      <Cta title={<>Free to start. <span className="text-primary italic">Yours either way</span>.</>} note="No card. Export anytime." />
    </>
  );
}
