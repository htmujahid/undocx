"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AddSourceDialog } from "~@/components/sources/add-source-dialog";
import { Button } from "~@/components/ui/button";
import { Input } from "~@/components/ui/input";
import { useSourceSearch, type SourcePage, type SourceSummary } from "~@/lib/sources/query";
import { ListPane } from "../../_components/list-pane";

function metaOf(source: SourceSummary) {
  const kind = source.kind === "link" ? "Link" : source.kind === "file" ? (source.filename ?? "File") : "Pasted text";
  const used = source.usage === 0 ? "Not used yet" : `In ${source.usage} ${source.usage === 1 ? "document" : "documents"}`;
  return `${kind} · ${used}`;
}

export function SourcesPane({ initial }: { initial: SourcePage }) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [query, setQuery] = useState("");
  const { items, hasMore, isLoading, isWaiting, isFetching, isLoadingMore, loadMore } = useSourceSearch({ query, initial });
  const rows = items.map((source) => ({ id: source.id, href: `/library/sources/${source.id}`, title: source.title, meta: metaOf(source), badge: source.kind === "link" ? undefined : `${source.wordCount.toLocaleString()}w` }));
  const isBusy = isWaiting || isFetching || isLoading;
  return (
    <>
      <ListPane
        title="Sources"
        createLabel="Add"
        onCreate={() => setIsAdding(true)}
        search={<Input type="search" aria-label="Search your sources" value={query} onValueChange={setQuery} placeholder="Search sources" />}
        items={rows}
        emptyText={query.trim() ? (isBusy ? "Searching…" : `No sources match “${query.trim()}”.`) : "No sources yet. Add a file, some text or a link."}
        footer={
          hasMore ? (
            <Button size="sm" variant="ghost" disabled={isLoadingMore} onClick={loadMore}>
              Show more
            </Button>
          ) : null
        }
      />
      <AddSourceDialog open={isAdding} onOpenChange={setIsAdding} onAdded={(source) => router.push(`/library/sources/${source.id}`)} />
    </>
  );
}
