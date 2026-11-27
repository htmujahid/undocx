"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useState } from "react";
import { Button } from "~@/components/ui/button";
import { CheckIcon, LoaderCircleIcon } from "~@/components/ui/icons";
import { $restoreBlock, AI_APPLY_VARIATION_COMMAND, useAiEdits, type AiEdit } from "~@/editor/extensions/ai-edits";
import { wordDiff } from "~@/lib/diff";
import { cn } from "~@/lib/utils";

function Diff({ before, after }: { before: string; after: string }) {
  return (
    <p className="m-0 rounded-md bg-primary/5 p-2 text-sm leading-normal whitespace-pre-wrap text-foreground">
      {wordDiff(before, after).map((part, index) =>
        part.kind === "same" ? (
          <span key={index}>{part.text}</span>
        ) : part.kind === "removed" ? (
          <del key={index} className="text-faint-foreground decoration-faint-foreground">
            {part.text}
          </del>
        ) : (
          <ins key={index} className="underline decoration-primary decoration-2 underline-offset-[0.16em] [text-decoration-skip-ink:none]">
            {part.text}
          </ins>
        ),
      )}
    </p>
  );
}

function EditCard({ edit }: { edit: AiEdit }) {
  const [editor] = useLexicalComposerContext();
  const { update, dismiss } = useAiEdits();
  const [isDiffOpen, setIsDiffOpen] = useState(false);
  const isDone = edit.status === "applied" || edit.status === "kept" || edit.status === "undone";

  function undo() {
    let restored = 0;
    editor.update(
      () => {
        for (const block of edit.blocks) if ($restoreBlock(block.key, block.before)) restored++;
      },
      { discrete: true },
    );
    if (restored === 0) update(edit.id, { status: "failed", error: "That text is no longer in the document, so the change cannot be undone." });
    else update(edit.id, { status: "undone" });
  }

  return (
    <li className={cn("grid gap-2 rounded-md border p-3 text-sm", edit.status === "failed" ? "border-destructive/40 bg-destructive/5" : "border-border bg-card")}>
      <div className="flex items-start justify-between gap-2">
        <p className="m-0 text-foreground">
          <span className="text-xs text-muted-foreground">{edit.status === "applied" ? "Changed" : edit.status === "kept" ? "Kept" : edit.status === "undone" ? "Undone" : edit.status === "choose" ? "Choose a version" : edit.status === "failed" ? "Not changed" : "Working"} · </span>
          {edit.label}
        </p>
        {edit.status === "working" ? <LoaderCircleIcon className="mt-0.5 size-4 shrink-0 animate-spin text-muted-foreground" /> : null}
      </div>

      {edit.status === "failed" ? (
        <p className="m-0 text-destructive" role="alert">
          {edit.error}
        </p>
      ) : null}

      {edit.status === "choose" && edit.options ? (
        <ol className="m-0 grid list-none gap-2 p-0">
          {edit.options.texts.map((text, index) => (
            <li key={index} className="grid gap-2 rounded-md border border-border bg-background p-2">
              <p className="m-0 whitespace-pre-wrap text-foreground">{text.replace(/\{\{cite:[^}]+\}\}/g, "")}</p>
              <Button size="sm" variant="secondary" className="justify-self-start" onClick={() => editor.dispatchCommand(AI_APPLY_VARIATION_COMMAND, { editId: edit.id, text })}>
                Use this version
              </Button>
            </li>
          ))}
        </ol>
      ) : null}

      {isDone && isDiffOpen ? (
        <div className="grid gap-2">
          {edit.blocks.map((block) => (
            <Diff key={block.key} before={block.beforeText} after={block.afterText} />
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {edit.status === "applied" ? (
          <>
            <Button size="sm" variant="primary" onClick={() => update(edit.id, { status: "kept" })}>
              <CheckIcon />
              Keep
            </Button>
            <Button size="sm" variant="ghost" onClick={undo}>
              Undo
            </Button>
          </>
        ) : null}
        {isDone && edit.status !== "undone" ? (
          <Button size="sm" variant="ghost" onClick={() => setIsDiffOpen((open) => !open)}>
            {isDiffOpen ? "Hide diff" : "Show diff"}
          </Button>
        ) : null}
        {edit.status !== "working" && edit.status !== "applied" ? (
          <Button size="sm" variant="ghost" onClick={() => dismiss(edit.id)}>
            Dismiss
          </Button>
        ) : null}
      </div>
    </li>
  );
}

export function AssistantEdits() {
  const { edits } = useAiEdits();
  if (edits.length === 0) return null;
  return (
    <section aria-label="Changes made by Undocx" className="mb-5 grid gap-2">
      <h3 className="m-0 font-mono text-[0.6rem] tracking-[0.15em] text-muted-foreground uppercase">Changes</h3>
      <ol className="m-0 grid list-none gap-2 p-0">
        {edits.map((edit) => (
          <EditCard key={edit.id} edit={edit} />
        ))}
      </ol>
    </section>
  );
}
