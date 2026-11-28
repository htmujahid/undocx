"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useState } from "react";
import { Button } from "~@/components/ui/button";
import { CheckIcon, LoaderCircleIcon } from "~@/components/ui/icons";
import { $restoreBlock, AI_APPLY_VARIATION_COMMAND, useAiEdits, type AiEdit } from "~@/editor/extensions/ai-edits";
import { wordDiff } from "~@/lib/diff";
import { useSaveVersion } from "../versions/query";
import { cn } from "~@/lib/utils";

export function EditCard({ edit, documentId }: { edit: AiEdit; documentId: string }) {
  const [editor] = useLexicalComposerContext();
  const { trigger: saveVersion } = useSaveVersion(documentId);
  const { update, dismiss } = useAiEdits();
  const [isDiffOpen, setIsDiffOpen] = useState(false);
  const isDone = edit.status === "applied" || edit.status === "kept" || edit.status === "undone";

  async function keep() {
    update(edit.id, { status: "kept" });
    const result = await saveVersion({
      kind: "ai",
      label: edit.label,
      content: JSON.stringify(editor.getEditorState().toJSON()),
      baseline: edit.beforeState ? JSON.stringify(edit.beforeState.toJSON()) : null,
    }).catch(() => ({ error: "The version could not be saved." }));
    if ("number" in result) update(edit.id, { versionNumber: result.number, beforeState: undefined });
    else update(edit.id, { versionError: result.error });
  }

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
          {edit.versionNumber ? <span className="text-xs text-muted-foreground"> · saved as v{edit.versionNumber}</span> : null}
        </p>
        {edit.status === "working" ? <LoaderCircleIcon className="mt-0.5 size-4 shrink-0 animate-spin text-muted-foreground" /> : null}
      </div>

      {edit.versionError ? <p className="m-0 text-xs text-muted-foreground">{edit.versionError}</p> : null}

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
            <Button size="sm" variant="primary" onClick={() => void keep()}>
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

export function Diff({ before, after }: { before: string; after: string }) {
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
