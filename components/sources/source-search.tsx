"use client";

import { useState, type ReactNode } from "react";
import { Button } from "~@/components/ui/button";
import { Input } from "~@/components/ui/input";
import { LoaderCircleIcon } from "~@/components/ui/icons";
import { useSourceSearch, type SourceSummary } from "~@/lib/sources/query";

export function sourceMeta(source: SourceSummary) {
  return source.kind === "link" ? "Link" : source.kind === "file" ? `${source.filename ?? "File"} · ${source.wordCount.toLocaleString()} words` : `Pasted text · ${source.wordCount.toLocaleString()} words`;
}

export function SourceSearch({ excludeDocumentId, emptyText, renderItem }: { excludeDocumentId?: string; emptyText: string; renderItem: (source: SourceSummary) => ReactNode }) {
  const [query, setQuery] = useState("");
  const { items, hasMore, isLoading, isWaiting, isFetching, isLoadingMore, loadMore } = useSourceSearch({ query, excludeDocumentId });
  const isBusy = isWaiting || isFetching || isLoading;
  return (
    <div className="grid gap-2">
      <Input type="search" aria-label="Search your sources" value={query} onValueChange={setQuery} placeholder="Search by title, file name or link" />
      <p className="m-0 flex h-4 items-center gap-1.5 text-xs text-muted-foreground" role="status">
        {isBusy ? (
          <>
            <LoaderCircleIcon className="size-3 animate-spin" />
            Searching…
          </>
        ) : query.trim() ? (
          `${items.length}${hasMore ? "+" : ""} ${items.length === 1 ? "match" : "matches"}`
        ) : null}
      </p>
      {!isLoading && items.length === 0 ? (
        <p className="m-0 text-sm text-muted-foreground">{query.trim() ? `No sources match “${query.trim()}”.` : emptyText}</p>
      ) : (
        <ul className="m-0 grid max-h-72 list-none gap-1 overflow-y-auto p-0">
          {items.map((item) => (
            <li key={item.id}>{renderItem(item)}</li>
          ))}
          {hasMore ? (
            <li className="pt-1">
              <Button size="sm" variant="ghost" disabled={isLoadingMore} onClick={loadMore}>
                {isLoadingMore ? <LoaderCircleIcon className="animate-spin" /> : null}
                Show more
              </Button>
            </li>
          ) : null}
        </ul>
      )}
    </div>
  );
}
