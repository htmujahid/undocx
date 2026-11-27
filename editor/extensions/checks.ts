import { $isListNode } from "@lexical/list";
import { $isTableNode } from "@lexical/table";
import { $createRangeSelection, $getNodeByKey, $getRoot, $isElementNode, $isTextNode, $setSelection, type ElementNode, type LexicalEditor, type LexicalNode, type TextNode } from "lexical";
import { $isLocked, $kindOf, $modelText, $plainText } from "./ai-edits";

export type TextIssue = { start: number; end: number; text: string; replacement: string | null };

export type Finding = TextIssue & { blockKey: string; nodeKey: string; isLocked: boolean; context: string };

function $textNodes(node: LexicalNode, found: TextNode[] = []): TextNode[] {
  if ($isTextNode(node)) found.push(node);
  else if ($isElementNode(node)) node.getChildren().forEach((child) => $textNodes(child, found));
  return found;
}

export function $findIssues(find: (text: string) => TextIssue[], limit = 300): Finding[] {
  const findings: Finding[] = [];
  for (const block of $getRoot().getChildren()) {
    if (!$isElementNode(block)) continue;
    const isLocked = $isLocked(block);
    for (const node of $textNodes(block)) {
      const text = node.getTextContent();
      for (const issue of find(text)) {
        if (findings.length >= limit) return findings;
        const from = Math.max(0, issue.start - 30);
        findings.push({ ...issue, blockKey: block.getKey(), nodeKey: node.getKey(), isLocked, context: `${from > 0 ? "…" : ""}${text.slice(from, issue.end + 30)}${issue.end + 30 < text.length ? "…" : ""}` });
      }
    }
  }
  return findings;
}

export function $applyReplacements(items: { nodeKey: string; start: number; end: number; replacement: string }[]) {
  const byNode = new Map<string, typeof items>();
  for (const item of items) byNode.set(item.nodeKey, [...(byNode.get(item.nodeKey) ?? []), item]);
  let applied = 0;
  for (const [nodeKey, list] of byNode) {
    const node = $getNodeByKey(nodeKey);
    if (!$isTextNode(node)) continue;
    for (const item of list.sort((a, b) => b.start - a.start)) {
      if (node.getTextContent().slice(item.start, item.end).length !== item.end - item.start) continue;
      node.spliceText(item.start, item.end - item.start, item.replacement);
      applied++;
    }
  }
  return applied;
}

export function $claimBlocks() {
  const blocks: { key: string; kind: "paragraph" | "list" | "quote" | "table"; text: string }[] = [];
  for (const block of $getRoot().getChildren()) {
    if (!$isElementNode(block)) continue;
    if ($isTableNode(block)) {
      const rows = block.getChildren().map((row) => ($isElementNode(row) ? row.getChildren().map((cell) => $plainText(cell)).join(" | ") : ""));
      const text = rows.join("\n").trim();
      if (text) blocks.push({ key: block.getKey(), kind: "table", text });
      continue;
    }
    const kind = $kindOf(block);
    if (kind !== "paragraph" && kind !== "list" && kind !== "quote") continue;
    const text = $modelText(block as ElementNode).trim();
    if (text) blocks.push({ key: block.getKey(), kind: $isListNode(block) ? "list" : kind, text });
  }
  return blocks;
}

export function $locateText(blockKey: string, needle: string) {
  const block = $getNodeByKey(blockKey);
  if (!block) return null;
  const wanted = needle.trim();
  for (const node of $textNodes(block)) {
    const at = node.getTextContent().indexOf(wanted);
    if (at !== -1) return { nodeKey: node.getKey(), start: at, end: at + wanted.length };
  }
  return null;
}

export function jumpTo(editor: LexicalEditor, blockKey: string, needle: string | null, after?: () => void) {
  let key = blockKey;
  editor.update(
    () => {
      const found = needle ? $locateText(blockKey, needle) : null;
      if (found) {
        key = found.nodeKey;
        const range = $createRangeSelection();
        range.anchor.set(found.nodeKey, found.start, "text");
        range.focus.set(found.nodeKey, found.end, "text");
        $setSelection(range);
      } else {
        const block = $getNodeByKey(blockKey);
        if ($isElementNode(block)) block.selectStart();
      }
      after?.();
    },
    {
      onUpdate: () => {
        editor.focus();
        editor.getElementByKey(key)?.scrollIntoView({ block: "center", behavior: "smooth" });
      },
    },
  );
}
