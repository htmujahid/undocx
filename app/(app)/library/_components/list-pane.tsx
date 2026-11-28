"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Button } from "~@/components/ui/button";
import { LoaderCircleIcon, PlusIcon } from "~@/components/ui/icons";
import { cn } from "~@/lib/utils";

export type ListItem = {
  id: string;
  href: string;
  title: string;
  meta: string;
  badge?: string;
};

export function ListPane({
  title,
  createLabel,
  createAction,
  onCreate,
  search,
  footer,
  items,
  emptyText,
}: {
  title: string;
  createLabel: string;
  createAction?: () => Promise<string | null>;
  onCreate?: () => void;
  search?: ReactNode;
  footer?: ReactNode;
  items: ListItem[];
  emptyText: string;
}) {
  const pathname = usePathname();
  const [error, setError] = useState<string | null>(null);
  return (
    <>
      <div className="flex h-12 shrink-0 items-center justify-between gap-2 px-4">
        <h2 className="m-0 font-mono text-[0.65rem] tracking-[0.15em] text-muted-foreground uppercase">
          {title} <span className="text-faint-foreground">{items.length}</span>
        </h2>
        <form action={async () => setError((await createAction?.()) ?? null)}>
          <Button type={onCreate ? "button" : "submit"} variant="primary" size="sm" onClick={onCreate}>
            <PlusIcon />
            {createLabel}
          </Button>
        </form>
      </div>
      {error ? (
        <p role="alert" className="m-0 px-4 pb-2 text-xs leading-normal text-destructive">
          {error}{" "}
          <Link href="/account" className="text-foreground underline">
            Plan
          </Link>
        </p>
      ) : null}
      {search ? <div className="px-4 pb-2">{search}</div> : null}
      {items.length === 0 ? (
        <p className="m-0 px-4 py-6 text-sm leading-normal text-muted-foreground">
          {emptyText}
        </p>
      ) : (
        <ul className="m-0 min-h-0 flex-1 list-none overflow-y-auto p-2 pt-0">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "grid gap-0.5 rounded-md px-3 py-2 no-underline transition-colors",
                    isActive ? "bg-muted" : "hover:bg-muted/60",
                  )}
                >
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                      {item.title}
                    </span>
                    {item.badge ? (
                      <span className="shrink-0 font-mono text-[0.6rem] tracking-[0.12em] text-primary uppercase">
                        {item.badge}
                      </span>
                    ) : null}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {item.meta}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      {footer ? <div className="shrink-0 px-4 pb-3">{footer}</div> : null}
    </>
  );
}

export function ListFallback() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex flex-1 items-start justify-center pt-12 text-muted-foreground"
    >
      <LoaderCircleIcon className="size-4 animate-spin" />
    </div>
  );
}
