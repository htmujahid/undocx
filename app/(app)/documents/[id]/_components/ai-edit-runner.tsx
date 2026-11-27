"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import { $getNodeByKey, $isElementNode, COMMAND_PRIORITY_EDITOR, type LexicalNode } from "lexical";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, buttonVariants } from "~@/components/ui/button";
import { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogTitle } from "~@/components/ui/dialog";
import { TextareaField } from "~@/components/ui/form-fields";
import {
  $captureSelection,
  $citationIds,
  $documentTitle,
  $isLocked,
  $kindOf,
  $modelText,
  $plainText,
  $replaceSelection,
  $sectionOf,
  $setBlockText,
  AI_APPLY_VARIATION_COMMAND,
  AI_ASK_COMMAND,
  AI_REGENERATE_COMMAND,
  AI_REWRITE_SELECTION_COMMAND,
  AI_VARIATIONS_COMMAND,
  snapshotBlocks,
  useAiEdits,
  type AiEdit,
  type AiEditBlock,
  type EditKind,
  type SelectionTarget,
} from "~@/editor/extensions/ai-edits";
import { usePanel } from "~@/editor/extensions/panel";
import { editLimits } from "~@/lib/ai/schemas";
import { useRewrite, useVariations } from "../query";

const instructionSchema = z.object({ instruction: z.string().trim().min(1, "Say what to change.").max(editLimits.instruction) });
type InstructionValues = z.infer<typeof instructionSchema>;

type Context = { title: string; before: string; after: string };

function $contextAround(first: LexicalNode, last: LexicalNode = first): Context {
  const text = (node: LexicalNode | null) => (node ? $plainText(node).slice(0, 800) : "");
  return { title: $documentTitle(), before: text(first.getPreviousSibling()), after: text(last.getNextSibling()) };
}

function snippet(text: string) {
  const clean = text.replace(/\{\{cite:[^}]+\}\}/g, "").replace(/\s+/g, " ").trim();
  return clean.length > 48 ? `${clean.slice(0, 48)}…` : clean;
}

type BlockRequest = { ok: false; error: string } | { ok: true; kind: EditKind; text: string; context: Context; allowed: Set<string> };

function $blockRequest(key: string): BlockRequest {
  const block = $getNodeByKey(key);
  if (!block || !$isElementNode(block)) return { ok: false, error: "That block is no longer in the document." };
  const kind = $kindOf(block);
  if (kind === "other") return { ok: false, error: "This kind of block cannot be rewritten." };
  if ($isLocked(block)) return { ok: false, error: "This block is locked as final. Unlock it first." };
  return { ok: true, kind, text: $modelText(block), context: $contextAround(block), allowed: $citationIds(block) };
}

export function AiEditRunner({ id }: { id: string }) {
  const [editor] = useLexicalComposerContext();
  const ai = useAiEdits();
  const panel = usePanel();
  const { trigger: rewrite } = useRewrite(id);
  const { trigger: variations } = useVariations(id);
  const targets = useRef(new Map<string, { selection?: SelectionTarget; blockKey: string | null; allowed: Set<string>; kind: EditKind }>());
  const [pending, setPending] = useState<((instruction: string) => void) | null>(null);
  const form = useForm<InstructionValues>({ resolver: zodResolver(instructionSchema), defaultValues: { instruction: "" } });

  const latest = useRef({ ai, panel, rewrite, variations });
  useEffect(() => {
    latest.current = { ai, panel, rewrite, variations };
  });

  useEffect(() => {
    const show = () => {
      latest.current.panel.setOpen(true);
      latest.current.panel.setTab("assistant");
    };
    const start = (label: string): AiEdit => {
      const edit: AiEdit = { id: crypto.randomUUID(), label, status: "working", blocks: [] };
      latest.current.ai.add(edit);
      show();
      return edit;
    };
    const fail = (edit: AiEdit, error: string) => latest.current.ai.update(edit.id, { status: "failed", error });

    const applyBlocks = (edit: AiEdit, changes: { key: string; text: string; allowed: Set<string> }[], selection?: SelectionTarget) => {
      const keys = changes.map((change) => change.key);
      const before = snapshotBlocks(editor, keys);
      const beforeState = editor.getEditorState();
      const records: AiEditBlock[] = [];
      let failed = false;
      editor.update(
        () => {
          for (const change of changes) {
            const block = $getNodeByKey(change.key);
            if (!block || !$isElementNode(block)) continue;
            const snapshot = before.get(change.key);
            if (!snapshot) continue;
            const beforeText = selection ? selection.text : $plainText(block);
            if (selection) {
              if (!$replaceSelection(selection, change.text)) {
                failed = true;
                continue;
              }
            } else $setBlockText(block, change.text, change.allowed);
            records.push({ key: change.key, before: snapshot, beforeText, afterText: change.text.replace(/\{\{cite:[^}]+\}\}/g, "") });
          }
        },
        { discrete: true },
      );
      if (failed || records.length === 0) {
        fail(edit, "The text changed while Undocx was working, so the change was not applied.");
        return;
      }
      latest.current.ai.update(edit.id, { status: "applied", blocks: records, options: undefined, beforeState });
    };

    const runRewrite = async (edit: AiEdit, payload: Parameters<typeof rewrite>[0], map: Map<number, { key: string; allowed: Set<string> }>, selection?: SelectionTarget) => {
      try {
        const result = await latest.current.rewrite(payload);
        const changes = result.items.flatMap((item) => {
          const target = map.get(item.index);
          return target ? [{ key: target.key, text: item.text, allowed: target.allowed }] : [];
        });
        applyBlocks(edit, changes, selection);
      } catch (error) {
        fail(edit, error instanceof Error ? error.message : "Something went wrong. Try again.");
      }
    };

    const rewriteSelection = (instruction: string) => {
      const target = editor.read(() => $captureSelection());
      if (!target) {
        fail(start("Rewrite"), "Select some text inside one paragraph first.");
        return;
      }
      const request = editor.read(() => $blockRequest(target.blockKey));
      const edit = start(instruction);
      if (!request.ok) return fail(edit, request.error);
      void runRewrite(
        edit,
        { action: "rewrite", instruction, items: [{ index: 0, kind: "selection", text: target.text, locked: false }], focus: [0], context: request.context },
        new Map([[0, { key: target.blockKey, allowed: request.allowed }]]),
        target,
      );
    };

    const regenerate = (key: string, scope: "block" | "section") => {
      if (scope === "block") {
        const request = editor.read(() => $blockRequest(key));
        const edit = start(request.ok ? `Regenerate “${snippet(request.text)}”` : "Regenerate");
        if (!request.ok) return fail(edit, request.error);
        void runRewrite(edit, { action: "regenerate", instruction: null, items: [{ index: 0, kind: request.kind, text: request.text, locked: false }], focus: [0], context: request.context }, new Map([[0, { key, allowed: request.allowed }]]));
        return;
      }
      const built = editor.read(() => {
        const heading = $getNodeByKey(key);
        if (!heading || !$isElementNode(heading)) return null;
        const { blocks } = $sectionOf(heading);
        const limited = blocks.slice(0, editLimits.items);
        const items = limited.map((block, index) => {
          const kind = $kindOf(block);
          const isLocked = $isLocked(block) || kind === "other";
          return { index, kind, text: kind === "other" ? "" : $modelText(block), locked: isLocked };
        });
        const map = new Map(limited.map((block, index) => [index, { key: block.getKey(), allowed: $citationIds(block) }]));
        const last = limited[limited.length - 1] ?? heading;
        return { title: $plainText(heading), items, map, context: $contextAround(heading, last) };
      });
      const edit = start(built ? `Regenerate the section “${snippet(built.title)}”` : "Regenerate section");
      if (!built) return fail(edit, "That section is no longer in the document.");
      const focus = built.items.filter((item) => !item.locked).map((item) => item.index);
      if (focus.length === 0) return fail(edit, "Everything in this section is locked or cannot be rewritten.");
      void runRewrite(edit, { action: "regenerate", instruction: null, items: built.items, focus, context: built.context }, built.map);
    };

    const showVariations = (key: string | null, instruction: string | null) => {
      const selection = key === null ? editor.read(() => $captureSelection()) : null;
      const blockKey = key ?? selection?.blockKey ?? null;
      if (!blockKey) {
        fail(start("Three variations"), "Select some text inside one paragraph first.");
        return;
      }
      const request = editor.read(() => $blockRequest(blockKey));
      const edit = start("Variations");
      if (!request.ok) return fail(edit, request.error);
      const text = selection ? selection.text : request.text;
      targets.current.set(edit.id, { selection: selection ?? undefined, blockKey, allowed: request.allowed, kind: request.kind });
      latest.current.ai.update(edit.id, { label: `Variations of “${snippet(text)}”` });
      void latest.current
        .variations({ instruction, item: { index: 0, kind: selection ? "selection" : request.kind, text, locked: false }, context: request.context })
        .then((result) => latest.current.ai.update(edit.id, { status: "choose", options: { blockKey, before: text, texts: result.variations } }))
        .catch((error: unknown) => fail(edit, error instanceof Error ? error.message : "Something went wrong. Try again."));
    };

    const ask = (key: string | null) => {
      const text = editor.read(() => {
        if (key === null) return $captureSelection()?.text ?? null;
        const block = $getNodeByKey(key);
        return block ? $plainText(block) : null;
      });
      if (!text?.trim()) return;
      latest.current.ai.setFocus(text.trim().slice(0, 2000));
      show();
    };


    return mergeRegister(
      editor.registerCommand(
        AI_REWRITE_SELECTION_COMMAND,
        ({ instruction }) => {
          if (instruction) rewriteSelection(instruction);
          else setPending(() => rewriteSelection);
          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand(AI_REGENERATE_COMMAND, ({ key, scope }) => (regenerate(key, scope), true), COMMAND_PRIORITY_EDITOR),
      editor.registerCommand(AI_VARIATIONS_COMMAND, ({ key }) => (showVariations(key, null), true), COMMAND_PRIORITY_EDITOR),
      editor.registerCommand(AI_ASK_COMMAND, ({ key }) => (ask(key), true), COMMAND_PRIORITY_EDITOR),
    );
  }, [editor]);

  useEffect(() => {
    const applyVariation = (editId: string, text: string) => {
          const target = targets.current.get(editId);
          if (!target?.blockKey) return;
          const blockKey = target.blockKey;
          const snapshot = snapshotBlocks(editor, [blockKey]).get(blockKey);
          const beforeState = editor.getEditorState();
          let beforeText = "";
          let ok = false;
          editor.update(
            () => {
              const block = $getNodeByKey(blockKey);
              if (!block || !$isElementNode(block) || !snapshot) return;
              beforeText = target.selection ? target.selection.text : $plainText(block);
              if (target.selection) ok = $replaceSelection(target.selection, text);
              else {
                $setBlockText(block, text, target.allowed);
                ok = true;
              }
            },
            { discrete: true },
          );
          if (!ok || !snapshot) latest.current.ai.update(editId, { status: "failed", error: "The text changed while you were choosing, so the change was not applied." });
          else latest.current.ai.update(editId, { status: "applied", options: undefined, beforeState, blocks: [{ key: blockKey, before: snapshot, beforeText, afterText: text.replace(/\{\{cite:[^}]+\}\}/g, "") }] });
    };

    return editor.registerCommand(
      AI_APPLY_VARIATION_COMMAND,
      ({ editId, text }) => {
        queueMicrotask(() => applyVariation(editId, text));
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  return (
    <Dialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
      <DialogBackdrop />
      <DialogContent className="w-[min(28rem,calc(100vw-2rem))]">
        <form
          noValidate
          onSubmit={form.handleSubmit(({ instruction }) => {
            const run = pending;
            setPending(null);
            form.reset();
            run?.(instruction);
          })}
        >
          <div className="grid gap-4 p-5">
            <div className="grid gap-2">
              <DialogTitle>Rewrite the selection</DialogTitle>
              <DialogDescription>Say what should change. Only the selected text is rewritten.</DialogDescription>
            </div>
            <TextareaField control={form.control} name="instruction" label="Instruction" isLabelHidden max={editLimits.instruction} autoFocus rows={3} placeholder="Make it sound less like a brochure" />
          </div>
          <div className="flex justify-end gap-2 border-t border-border p-4">
            <DialogClose className={buttonVariants({ variant: "ghost" })}>Cancel</DialogClose>
            <Button type="submit" variant="primary">
              Rewrite
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
