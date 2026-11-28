"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "~@/components/ui/button";
import { PlusIcon } from "~@/components/ui/icons";

export type LibraryItem = {
  id: string;
  href: string;
  title: string;
  meta: string;
  badge?: string;
  menu?: ReactNode;
};

export function LibraryList({
  title,
  description,
  createLabel,
  createHref,
  onCreate,
  toolbar,
  footer,
  items,
  emptyText,
}: {
  title: string;
  description: string;
  createLabel: string;
  createHref?: string;
  onCreate?: () => void;
  toolbar?: ReactNode;
  footer?: ReactNode;
  items: LibraryItem[];
  emptyText: string;
}) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 max-w-xl">
          <p className="m-0 font-mono text-[0.65rem] tracking-[0.15em] text-muted-foreground uppercase">Library</p>
          <h1 className="m-0 mt-1 font-serif text-3xl font-medium tracking-tight text-foreground">{title}</h1>
          <p className="m-0 mt-2 text-sm leading-normal text-muted-foreground">{description}</p>
        </div>
        <Button variant="primary" onClick={onCreate} render={createHref ? <Link href={createHref} /> : undefined}>
          <PlusIcon />
          {createLabel}
        </Button>
      </div>

      {toolbar ? <div className="mt-6 max-w-md">{toolbar}</div> : null}

      {items.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-input p-8">
          <p className="m-0 text-sm leading-normal text-muted-foreground">{emptyText}</p>
        </div>
      ) : (
        <ul className="m-0 mt-8 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.id} className="group relative rounded-lg border border-border bg-card p-5 transition-colors focus-within:border-primary hover:border-primary">
              <div className="grid h-full content-between gap-6">
                <span className="grid gap-2 pr-8">
                  {item.badge ? <span className="font-mono text-[0.65rem] tracking-[0.15em] text-primary uppercase">{item.badge}</span> : null}
                  <Link href={item.href} className="font-serif text-xl leading-tight text-foreground no-underline outline-none group-hover:text-primary-deep after:absolute after:inset-0 after:rounded-lg after:content-['']">
                    {item.title}
                  </Link>
                </span>
                <span className="text-xs leading-normal text-muted-foreground">{item.meta}</span>
              </div>
              {item.menu ? <div className="absolute top-3 right-3 z-10">{item.menu}</div> : null}
            </li>
          ))}
        </ul>
      )}

      {footer ? <div className="mt-6">{footer}</div> : null}
    </div>
  );
}
