import { LockIcon } from "~@/components/ui/icons";
import type { ReactNode } from "react";
import { cn } from "~@/lib/utils";

export function Sheet({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("w-full min-w-0 overflow-hidden rounded-lg border border-input bg-card", className)}>
      {children}
    </div>
  );
}

export function SheetChrome({ title, children }: { title: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex min-h-12 flex-wrap items-center justify-between gap-3 border-b border-border px-3 py-2 text-sm text-muted-foreground sm:px-5">
      <p className="m-0 min-w-0 flex-1 basis-full truncate font-sans text-sm font-medium text-foreground sm:basis-0">
        {title}
      </p>
      {children ? <div className="flex shrink-0 items-center gap-3 whitespace-nowrap">{children}</div> : null}
    </div>
  );
}

export function SheetPage({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("px-4 py-5 font-sans text-doc text-foreground sm:px-6 sm:py-8 lg:px-8", className)}>
      {children}
    </div>
  );
}

export function SectionLabel({ number, children }: { number?: string; children: ReactNode }) {
  return (
    <p className="m-0 mb-1 flex items-baseline gap-2 text-sm text-muted-foreground">
      {number ? <span className="tabular-nums text-primary">{number}</span> : null}
      <span>{children}</span>
    </p>
  );
}

export function DocHeading({ children }: { children: ReactNode }) {
  return <h2 className="m-0 mb-4 font-serif text-xl font-medium leading-tight tracking-tight text-foreground">{children}</h2>;
}

export const paragraphClass = "m-0 mb-4 max-w-measure";
export const removedClass = "text-faint-foreground line-through decoration-faint-foreground decoration-1";
export const addedClass = "underline decoration-primary decoration-2 underline-offset-[0.16em] [text-decoration-skip-ink:none]";
export const dimClass = "text-muted-foreground";

export function LockedMark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex size-6 items-center justify-center text-primary", className)} title="Final. Rewrites skip this paragraph.">
      <LockIcon className="size-3.5" />
      <span className="sr-only">Locked</span>
    </span>
  );
}

export function MarginRow({ mark, className, children }: { mark?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <div className={cn("grid grid-cols-[minmax(0,1fr)_1.5rem] items-start gap-x-3", className)}>
      <div className="min-w-0">{children}</div>
      <span className="flex justify-center">{mark}</span>
    </div>
  );
}

export function Instruction({ label, children }: { label: string; children: ReactNode }) {
  return (
    <p className="m-0 mb-3 flex max-w-measure items-baseline gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground">
      <span className="font-medium whitespace-nowrap text-primary">{label}</span>
      <span className="font-serif text-base text-foreground italic">“{children}”</span>
    </p>
  );
}

export function Caret() {
  return (
    <span
      aria-hidden="true"
      className="ml-px inline-block h-[1em] w-0.5 bg-primary align-[-0.15em] animate-caret motion-reduce:animate-none"
    />
  );
}
