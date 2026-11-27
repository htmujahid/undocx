"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AddSourceDialog } from "~@/components/sources/add-source-dialog";
import { useSources, type SourceSummary } from "~@/lib/sources/query";
import { ListPane } from "../../_components/list-pane";

function metaOf(source: SourceSummary) {
  const kind = source.kind === "link" ? "Link" : source.kind === "file" ? (source.filename ?? "File") : "Pasted text";
  const used = source.usage === 0 ? "Not used yet" : `In ${source.usage} ${source.usage === 1 ? "document" : "documents"}`;
  return `${kind} · ${used}`;
}

export function SourcesPane({ initial }: { initial: SourceSummary[] }) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const { data = initial } = useSources(initial);
  const items = data.map((source) => ({ id: source.id, href: `/library/sources/${source.id}`, title: source.title, meta: metaOf(source), badge: source.kind === "link" ? undefined : `${source.wordCount.toLocaleString()}w` }));
  return (
    <>
      <ListPane title="Sources" createLabel="Add" onCreate={() => setIsAdding(true)} items={items} emptyText="No sources yet. Add a file, some text or a link." />
      <AddSourceDialog open={isAdding} onOpenChange={setIsAdding} onAdded={(source) => router.push(`/library/sources/${source.id}`)} />
    </>
  );
}
