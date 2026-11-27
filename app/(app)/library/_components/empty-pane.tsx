import type { ComponentType, ReactNode } from "react";

export function EmptyPane({
  icon: Icon,
  title,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full min-h-80 flex-col items-center justify-center gap-3 px-6 text-center">
      <Icon className="size-8 text-faint-foreground" />
      <h2 className="m-0 font-serif text-2xl font-medium text-foreground">
        {title}
      </h2>
      <p className="m-0 max-w-sm text-sm leading-normal text-muted-foreground">
        {children}
      </p>
    </div>
  );
}

export function PaneFallback() {
  return <div role="status" aria-label="Loading" className="h-full min-h-80" />;
}

export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-label={title}
      className="grid gap-4 rounded-lg border border-border bg-card p-5"
    >
      <div>
        <h2 className="m-0 font-serif text-xl font-medium text-foreground">
          {title}
        </h2>
        <p className="m-0 text-sm leading-normal text-muted-foreground">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}
