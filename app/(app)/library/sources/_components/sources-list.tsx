"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AddSourceDialog } from "~@/components/sources/add-source-dialog";
import { Button } from "~@/components/ui/button";
import { useSourceSearch, type SourcePage, type SourceSummary } from "~@/lib/sources/query";
import { SourceMenu } from "./source-menu";
import { LibraryList } from "../../_components/library-list";

function metaOf(source: SourceSummary) {
  const kind = source.kind === "link" ? "Link" : source.kind === "file" ? (source.filename ?? "File") : "Pasted text";
  const used = source.usage === 0 ? "Not used yet" : `In ${source.usage} ${source.usage === 1 ? "document" : "documents"}`;
  return `${kind} · ${used}`;
}

export function SourcesList({ initial }: { initial: SourcePage }) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const { items, hasMore, isLoadingMore, loadMore } = useSourceSearch({ query: "", initial });
  const rows = items.map((source) => ({ id: source.id, href: `/library/sources/${source.id}`, title: source.title, meta: metaOf(source), badge: source.kind === "link" ? undefined : `${source.wordCount.toLocaleString()}w`, menu: <SourceMenu source={source} /> }));
  return (
    <>
      <LibraryList
        title="Sources"
        description="Files, pasted text and links you can attach to any document. Undocx reads them, writes from them and cites them. Free keeps 10 sources, Pro keeps 100."
        createLabel="Add source"
        onCreate={() => setIsAdding(true)}
        items={rows}
        emptyText="No sources yet. Add a file, some text or a link."
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
