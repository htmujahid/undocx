import Link from "next/link";
import { Button } from "~@/components/ui/button";
import { startHref } from "./links";
import { railColumns } from "./frame";

export function Cta({
  title = (
    <>
      You write the brief. You keep <span className="text-primary italic">the last word</span>.
    </>
  ),
  note = "Free to start. Export anytime.",
}: {
  title?: React.ReactNode;
  note?: string;
}) {
  return (
    <section id="start" aria-labelledby="cta-title" className={`grid grid-cols-1 border-t border-border ${railColumns}`}>
      <div className="flex flex-col gap-3 px-gutter pt-12 pb-4 lg:py-20">
        <p className="m-0 flex items-center gap-2 font-mono text-xs tracking-[0.15em] text-foreground uppercase">
          <span aria-hidden="true" className="inline-block size-1.5 rounded-full bg-primary" />
          Start
        </p>
        <p className="m-0 text-sm leading-normal text-muted-foreground">{note}</p>
      </div>
      <div className="flex min-w-0 flex-col gap-8 px-gutter pt-4 pb-12 lg:py-20">
        <h2 id="cta-title" className="m-0 max-w-[20ch] font-serif text-display font-normal text-balance text-foreground">
          {title}
        </h2>
        <div>
          <Button variant="primary" size="lg" render={<Link href={startHref} />}>
            Start writing free
          </Button>
        </div>
      </div>
    </section>
  );
}
