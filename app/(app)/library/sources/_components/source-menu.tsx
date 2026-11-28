"use client";

import { useDeleteSource } from "~@/lib/sources/query";
import { LibraryItemMenu } from "../../_components/library-item-menu";

export function SourceMenu({ source }: { source: { id: string; title: string; usage: number } }) {
  const { trigger: remove } = useDeleteSource(source.id);
  const used = source.usage;
  return (
    <LibraryItemMenu
      label={source.title}
      deleteTitle="Delete this source?"
      deleteDescription={used > 0 ? `It is used in ${used} ${used === 1 ? "document" : "documents"}. Their text stays, but the citations lose their source.` : "The file and its text are deleted."}
      onDelete={() => remove()}
    />
  );
}
