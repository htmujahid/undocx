import { signal } from "@lexical/extension";
import { $createListItemNode, $isListNode } from "@lexical/list";
import { useExtensionDependency } from "@lexical/react/useExtensionComponent";
import { useSignalValue } from "@lexical/react/useExtensionSignalValue";
import { $isHeadingNode, $isQuoteNode } from "@lexical/rich-text";
import {
  $createLineBreakNode,
  $createRangeSelection,
  $createTextNode,
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $getState,
  $isElementNode,
  $isLineBreakNode,
  $isParagraphNode,
  $isRangeSelection,
  $isTextNode,
  $parseSerializedNode,
  $setSelection,
  createCommand,
  defineExtension,
  type EditorState,
  type ElementNode,
  type LexicalEditor,
  type LexicalNode,
  type SerializedLexicalNode,
  type TextNode,
} from "lexical";
import { $createCitationNode, $isCitationNode } from "../nodes/citation-node";
import { $findTopLevelElement } from "../selection";
import { lockedState } from "./lock";

export type EditKind = "selection" | "paragraph" | "heading" | "quote" | "list" | "other";

export type AiEditBlock = { key: string; before: SerializedLexicalNode; beforeText: string; afterText: string };

export type AiEdit = {
  id: string;
  label: string;
  status: "working" | "applied" | "kept" | "undone" | "choose" | "failed";
  error?: string;
  blocks: AiEditBlock[];
  options?: { blockKey: string | null; before: string; texts: string[] };
  beforeState?: EditorState;
  versionNumber?: number;
  versionError?: string;
};

export const AI_REWRITE_SELECTION_COMMAND = createCommand<{ instruction: string | null }>("AI_REWRITE_SELECTION_COMMAND");
export const AI_REGENERATE_COMMAND = createCommand<{ key: string; scope: "block" | "section" }>("AI_REGENERATE_COMMAND");
export const AI_VARIATIONS_COMMAND = createCommand<{ key: string | null }>("AI_VARIATIONS_COMMAND");
export const AI_APPLY_VARIATION_COMMAND = createCommand<{ editId: string; text: string }>("AI_APPLY_VARIATION_COMMAND");
export const AI_ASK_COMMAND = createCommand<{ key: string | null }>("AI_ASK_COMMAND");

const MARKER = /\{\{cite:([^}]+)\}\}/g;

export const AiEditsExtension = defineExtension({
  name: "undocx/AiEdits",
  build: () => {
    const edits = signal<AiEdit[]>([]);
    const focus = signal<string | null>(null);
    return {
      edits,
      focus,
      add(edit: AiEdit) {
        edits.value = [edit, ...edits.peek()];
      },
      update(id: string, patch: Partial<AiEdit>) {
        edits.value = edits.peek().map((edit) => (edit.id === id ? { ...edit, ...patch } : edit));
      },
      dismiss(id: string) {
        edits.value = edits.peek().filter((edit) => edit.id !== id);
      },
      setFocus(text: string | null) {
        focus.value = text;
      },
    };
  },
});

export function useAiEdits() {
  const { output } = useExtensionDependency(AiEditsExtension);
  return { edits: useSignalValue(output.edits), focus: useSignalValue(output.focus), add: output.add, update: output.update, dismiss: output.dismiss, setFocus: output.setFocus };
}

export function $kindOf(node: LexicalNode): EditKind {
  if ($isParagraphNode(node)) return "paragraph";
  if ($isHeadingNode(node)) return "heading";
  if ($isQuoteNode(node)) return "quote";
  if ($isListNode(node)) return "list";
  return "other";
}

export function $isLocked(node: LexicalNode) {
  return $getState(node, lockedState);
}

function $inlineText(node: LexicalNode): string {
  if ($isTextNode(node)) return node.getTextContent();
  if ($isCitationNode(node)) return `{{cite:${node.getSourceId()}}}`;
  if ($isLineBreakNode(node)) return "\n";
  if ($isElementNode(node)) return node.getChildren().map($inlineText).join("");
  return "";
}

export function $modelText(block: ElementNode): string {
  if ($isListNode(block)) return block.getChildren().map($inlineText).join("\n");
  return $inlineText(block);
}

export function $plainText(block: LexicalNode) {
  return $inlineText(block).replace(MARKER, "");
}

export function $firstTextNode(node: LexicalNode): TextNode | null {
  if ($isTextNode(node)) return node;
  if ($isElementNode(node)) for (const child of node.getChildren()) {
    const found = $firstTextNode(child);
    if (found) return found;
  }
  return null;
}

type Look = { format: number; style: string };

function $fill(parent: ElementNode, text: string, look: Look | null, allowed: Set<string>) {
  const pieces = text.split(MARKER);
  for (let index = 0; index < pieces.length; index++) {
    if (index % 2 === 1) {
      if (allowed.has(pieces[index])) parent.append($createCitationNode(pieces[index]));
      continue;
    }
    const lines = pieces[index].split("\n");
    for (const [lineIndex, line] of lines.entries()) {
      if (lineIndex > 0) parent.append($createLineBreakNode());
      if (!line) continue;
      const node = $createTextNode(line);
      if (look) {
        node.setFormat(look.format);
        node.setStyle(look.style);
      }
      parent.append(node);
    }
  }
}

export function $citationIds(block: LexicalNode): Set<string> {
  const ids = new Set<string>();
  const visit = (node: LexicalNode) => {
    if ($isCitationNode(node)) ids.add(node.getSourceId());
    else if ($isElementNode(node)) node.getChildren().forEach(visit);
  };
  visit(block);
  return ids;
}

export function $setBlockText(block: ElementNode, text: string, allowed: Set<string>) {
  const template = $firstTextNode(block);
  const look = template ? { format: template.getFormat(), style: template.getStyle() } : null;
  if ($isListNode(block)) {
    const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
    if (lines.length === 0) return;
    const previous = block.getChildren();
    for (const line of lines) {
      const item = $createListItemNode();
      $fill(item, line, look, allowed);
      block.append(item);
    }
    for (const old of previous) old.remove();
    return;
  }
  block.clear();
  $fill(block, text, look, allowed);
}

export function snapshotBlocks(editor: LexicalEditor, keys: string[]) {
  const json = editor.getEditorState().toJSON();
  const result = new Map<string, SerializedLexicalNode>();
  editor.read(() => {
    for (const key of keys) {
      const node = $getNodeByKey(key);
      if (node) result.set(key, json.root.children[node.getIndexWithinParent()]);
    }
  });
  return result;
}

export function $restoreBlock(key: string, json: SerializedLexicalNode) {
  const current = $getNodeByKey(key);
  if (!$isElementNode(current)) return false;
  const restored = $parseSerializedNode(json);
  if (!$isElementNode(restored)) return false;
  const previous = current.getChildren();
  current.append(...restored.getChildren());
  for (const old of previous) old.remove();
  return true;
}

export type SelectionTarget = {
  blockKey: string;
  text: string;
  anchor: { key: string; offset: number; type: "text" | "element" };
  focus: { key: string; offset: number; type: "text" | "element" };
};

export function $captureSelection(): SelectionTarget | null {
  const selection = $getSelection();
  if (!$isRangeSelection(selection) || selection.isCollapsed()) return null;
  const first = $findTopLevelElement(selection.anchor.getNode());
  const second = $findTopLevelElement(selection.focus.getNode());
  if (first.getKey() !== second.getKey() || first.getKey() === "root") return null;
  const text = selection.getTextContent();
  if (!text.trim()) return null;
  return {
    blockKey: first.getKey(),
    text,
    anchor: { key: selection.anchor.key, offset: selection.anchor.offset, type: selection.anchor.type },
    focus: { key: selection.focus.key, offset: selection.focus.offset, type: selection.focus.type },
  };
}

export function $replaceSelection(target: SelectionTarget, text: string) {
  const range = $createRangeSelection();
  range.anchor.set(target.anchor.key, target.anchor.offset, target.anchor.type);
  range.focus.set(target.focus.key, target.focus.offset, target.focus.type);
  if (range.getTextContent() !== target.text) return false;
  $setSelection(range);
  range.insertText(text.replace(/\s*\n\s*/g, " "));
  return true;
}

export function $sectionOf(heading: ElementNode) {
  const level = $isHeadingNode(heading) ? Number(heading.getTag().slice(1)) : 1;
  const blocks: ElementNode[] = [];
  let next = heading.getNextSibling();
  while (next) {
    if ($isHeadingNode(next) && Number(next.getTag().slice(1)) <= level) break;
    if ($isElementNode(next)) blocks.push(next);
    next = next.getNextSibling();
  }
  return { blocks, after: next };
}

export function $documentTitle() {
  const first = $getRoot().getFirstChild();
  return $isHeadingNode(first) ? first.getTextContent() : "";
}
