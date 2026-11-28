"use client";

import { useState } from "react";
import { Button } from "~@/components/ui/button";
import { SourceSearch, sourceMeta } from "~@/components/sources/source-search";
import type { CreatedSource } from "~@/lib/sources/actions";
import { useAttachSource, type SourceSummary } from "~@/lib/sources/query";
import { Failure } from "./source-failure";

export function LibraryPanel({ documentId, onAdded }: { documentId: string; onAdded: (source: CreatedSource) => void }) {
  const { trigger, isMutating } = useAttachSource(documentId);
  const [problem, setProblem] = useState<string | null>(null);

  async function attach(item: SourceSummary) {
    setProblem(null);
    const result = await trigger(item.id);
    if (result && "error" in result && result.error) return setProblem(result.error);
    onAdded({ id: item.id, kind: item.kind, title: item.title, url: item.url });
  }

  return (
    <div className="grid gap-3">
      <SourceSearch
        excludeDocumentId={documentId}
        emptyText="Nothing left to add. Everything in your library is already in this document, or your library is empty."
        renderItem={(item) => (
          <div className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 hover:bg-muted">
            <span className="grid min-w-0">
              <span className="truncate text-sm text-foreground">{item.title}</span>
              <span className="truncate text-xs text-muted-foreground">{sourceMeta(item)}</span>
            </span>
            <Button size="sm" variant="secondary" disabled={isMutating} onClick={() => void attach(item)}>
              Add
            </Button>
          </div>
        )}
      />
      <Failure message={problem} />
    </div>
  );
}
