import type { ReactNode } from "react";
import { cn } from "~@/lib/utils";

export const railColumns = "lg:grid-cols-[16rem_minmax(0,1fr)]";

export function Page({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-[calc(100dvh-var(--spacing-nav))] flex-col bg-background font-sans text-foreground">
      <article className="relative mx-auto flex w-full max-w-page flex-1 flex-col border-x border-border max-lg:border-x-0 lg:before:absolute lg:before:inset-y-0 lg:before:left-[16rem] lg:before:w-px lg:before:bg-border lg:before:content-['']">
        {children}
      </article>
    </main>
  );
}

function Rail({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2 px-gutter pt-12 pb-4 lg:py-16", className)}>{children}</div>
  );
}

function Detail({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("min-w-0 px-gutter pt-4 pb-12 lg:py-16", className)}>{children}</div>;
}

export function Section({
  id,
  number,
  label,
  note,
  title,
  description,
  tone = "paper",
  children,
}: {
  id: string;
  number?: string;
  label: string;
  note?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  tone?: "paper" | "muted" | "accent";
  children: ReactNode;
}) {
  const titleId = `${id}-title`;
  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cn(
        "grid grid-cols-1 scroll-mt-16 border-t border-border",
        railColumns,
        tone === "muted" && "bg-muted/60",
        tone === "accent" && "bg-primary/5",
      )}
    >
      <Rail>
        <p className="m-0 font-mono text-xs tracking-[0.15em] uppercase">
          {number ? <span className="block text-primary">{number}</span> : null}
          <span className="block text-foreground">{label}</span>
        </p>
        {note ? <p className="m-0 text-sm leading-normal text-muted-foreground">{note}</p> : null}
      </Rail>
      <Detail className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <h2 id={titleId} className="m-0 max-w-[28ch] font-serif text-feature font-normal text-balance text-foreground">
            {title}
          </h2>
          {description ? <p className="m-0 max-w-measure text-base leading-relaxed text-muted-foreground">{description}</p> : null}
        </div>
        <div className="min-w-0">{children}</div>
      </Detail>
    </section>
  );
}

export function Intro({
  id = "intro",
  label,
  tagline,
  children,
}: {
  id?: string;
  label: string;
  tagline?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn("grid grid-cols-1", railColumns)}>
      <Rail className="lg:pt-20">
        <p className="m-0 flex items-center gap-2 font-mono text-xs tracking-[0.15em] text-foreground uppercase">
          <span aria-hidden="true" className="inline-block size-1.5 rounded-full bg-primary" />
          {label}
        </p>
        {tagline ? <p className="m-0 text-sm leading-normal text-muted-foreground">{tagline}</p> : null}
      </Rail>
      <Detail className="lg:pt-20">{children}</Detail>
    </section>
  );
}

export function Title({ id = "intro-title", children }: { id?: string; children: ReactNode }) {
  return (
    <h1 id={id} className="m-0 max-w-[22ch] font-serif text-display font-normal text-balance text-foreground">
      {children}
    </h1>
  );
}

export function Lede({ children }: { children: ReactNode }) {
  return <p className="m-0 max-w-measure text-lg leading-[1.55] text-muted-foreground">{children}</p>;
}

export function Body({ children }: { children: ReactNode }) {
  return <p className="m-0 max-w-measure text-base leading-relaxed text-muted-foreground">{children}</p>;
}

export function FeatureTitle({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h3 id={id} className="m-0 font-serif text-feature font-normal text-balance text-foreground">
      {children}
    </h3>
  );
}

export function Stack({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-col gap-4", className)}>{children}</div>;
}

export function Split({ children, className, isFlipped = false }: { children: ReactNode; className?: string; isFlipped?: boolean }) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 items-start gap-6",
        isFlipped ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,15rem)]" : "lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Rows({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid border-t border-input", className)}>{children}</div>;
}

export function Row({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("border-b border-border py-5", className)}>{children}</div>;
}
