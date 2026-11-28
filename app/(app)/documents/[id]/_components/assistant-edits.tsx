"use client";

import { useAiEdits } from "~@/editor/extensions/ai-edits";
import { EditCard } from "./edit-card";

export function AssistantEdits({ documentId }: { documentId: string }) {
  const { edits } = useAiEdits();
  if (edits.length === 0) return null;
  return (
    <section aria-label="Changes made by Undocx" className="mb-5 grid gap-2">
      <h3 className="m-0 font-mono text-[0.6rem] tracking-[0.15em] text-muted-foreground uppercase">Changes</h3>
      <ol className="m-0 grid list-none gap-2 p-0">
        {edits.map((edit) => (
          <EditCard key={edit.id} edit={edit} documentId={documentId} />
        ))}
      </ol>
    </section>
  );
}
