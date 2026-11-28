"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "~@/components/ui/button";
import { PlusIcon } from "~@/components/ui/icons";
import { listHref, type ListQuery } from "~@/lib/documents/list-query";
import { cn } from "~@/lib/utils";
import { FolderDialog } from "./folder-dialog";
import { FolderItem } from "./folder-item";

type Counted = { id: string; name: string; documents: number };

function RailLink({ href, label, count, isActive }: { href: string; label: string; count: number; isActive: boolean }) {
  return (
    <li className={cn("rounded-md", isActive ? "bg-muted" : "hover:bg-muted/60")}>
      <Link href={href} aria-current={isActive ? "page" : undefined} className="flex items-baseline justify-between gap-2 px-3 py-1.5 text-sm text-foreground no-underline">
        <span className="truncate">{label}</span>
        <span className="shrink-0 text-xs text-muted-foreground">{count}</span>
      </Link>
    </li>
  );
}

export function FolderRail({ query, folders, tags, counts }: { query: ListQuery; folders: Counted[]; tags: Counted[]; counts: { all: number; unfiled: number } }) {
  const [isCreating, setIsCreating] = useState(false);
  return (
    <nav aria-label="Folders and tags" className="grid content-start gap-6">
      <section aria-labelledby="folders-title" className="grid gap-2">
        <div className="flex items-center justify-between gap-2">
          <h2 id="folders-title" className="m-0 font-mono text-[0.65rem] tracking-[0.15em] text-muted-foreground uppercase">
            Folders
          </h2>
          <Button size="icon" variant="ghost" aria-label="New folder" className="size-7" onClick={() => setIsCreating(true)}>
            <PlusIcon className="size-4" />
          </Button>
        </div>
        <ul className="m-0 grid list-none gap-0.5 p-0">
          <RailLink href={listHref(query, { folder: "all" })} label="All documents" count={counts.all} isActive={query.folder === "all"} />
          <RailLink href={listHref(query, { folder: "none" })} label="Unfiled" count={counts.unfiled} isActive={query.folder === "none"} />
          {folders.map((folder) => (
            <FolderItem key={folder.id} folder={folder} href={listHref(query, { folder: folder.id })} isActive={query.folder === folder.id} />
          ))}
        </ul>
      </section>
      {tags.length > 0 ? (
        <section aria-labelledby="tags-title" className="grid gap-2">
          <h2 id="tags-title" className="m-0 font-mono text-[0.65rem] tracking-[0.15em] text-muted-foreground uppercase">
            Tags
          </h2>
          <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
            {tags.map((tag) => {
              const isActive = query.tag === tag.id;
              return (
                <li key={tag.id}>
                  <Link
                    href={listHref(query, { tag: isActive ? null : tag.id })}
                    aria-current={isActive ? "true" : undefined}
                    className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs no-underline transition-colors", isActive ? "border-primary bg-primary/10 text-foreground" : "border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground")}
                  >
                    {tag.name}
                    <span className="text-faint-foreground">{tag.documents}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
      <FolderDialog open={isCreating} onOpenChange={setIsCreating} />
    </nav>
  );
}
