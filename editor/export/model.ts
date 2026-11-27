import { $isLinkNode } from "@lexical/link";
import { $isListItemNode, $isListNode, type ListNode } from "@lexical/list";
import { $isHeadingNode, $isQuoteNode } from "@lexical/rich-text";
import { $isTableCellNode, $isTableNode, $isTableRowNode, TableCellHeaderStates } from "@lexical/table";
import { $isHorizontalRuleNode } from "@lexical/extension";
import { $getRoot, $isElementNode, $isLineBreakNode, $isParagraphNode, $isTextNode, type ElementNode, type LexicalNode } from "lexical";
import { $citationNumber, $isCitationNode } from "../nodes/citation-node";
import { $isLayoutContainerNode } from "../nodes/layout-container-node";
import { $isPageBreakNode } from "../nodes/page-break-node";
import { $getPageSettings, pageDimensions, resolveMargins } from "../extensions/page";

export type Align = "left" | "center" | "right" | "justify";

export type Run = { text: string; bold?: boolean; italic?: boolean; underline?: boolean; strike?: boolean; code?: boolean; sup?: boolean; href?: string };

export type ListItem = { level: number; content: Run[] };

export type Block =
  | { type: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6; content: Run[]; align: Align }
  | { type: "paragraph"; content: Run[]; align: Align }
  | { type: "quote"; content: Run[] }
  | { type: "list"; ordered: boolean; items: ListItem[] }
  | { type: "table"; rows: { isHeader: boolean; cells: Run[][] }[] }
  | { type: "rule" }
  | { type: "pagebreak" };

export type Reference = { number: number; title: string; url?: string };

export type ExportDoc = {
  title: string;
  page: { width: number; height: number; top: number; right: number; bottom: number; left: number };
  blocks: Block[];
  references: Reference[];
};

function alignOf(node: ElementNode): Align {
  const format = node.getFormatType();
  return format === "center" || format === "right" || format === "justify" ? format : "left";
}

function $runs(children: LexicalNode[], href?: string): Run[] {
  const runs: Run[] = [];
  for (const child of children) {
    if ($isTextNode(child)) {
      runs.push({ text: child.getTextContent(), bold: child.hasFormat("bold") || undefined, italic: child.hasFormat("italic") || undefined, underline: child.hasFormat("underline") || undefined, strike: child.hasFormat("strikethrough") || undefined, code: child.hasFormat("code") || undefined, href });
    } else if ($isLineBreakNode(child)) runs.push({ text: "\n" });
    else if ($isCitationNode(child)) runs.push({ text: String($citationNumber(child)), sup: true });
    else if ($isLinkNode(child)) runs.push(...$runs(child.getChildren(), child.getURL()));
    else if ($isElementNode(child)) runs.push(...$runs(child.getChildren(), href));
  }
  return runs.filter((run) => run.text.length > 0);
}

function $listItems(list: ListNode, level: number, items: ListItem[]) {
  for (const item of list.getChildren()) {
    if (!$isListItemNode(item)) continue;
    const own = item.getChildren().filter((child) => !$isListNode(child));
    if (own.length > 0 || !item.getChildren().some($isListNode)) items.push({ level, content: $runs(own) });
    for (const child of item.getChildren()) if ($isListNode(child)) $listItems(child, level + 1, items);
  }
}

function $blocks(parent: ElementNode, blocks: Block[]) {
  for (const node of parent.getChildren()) {
    if ($isHeadingNode(node)) blocks.push({ type: "heading", level: Number(node.getTag().slice(1)) as 1 | 2 | 3 | 4 | 5 | 6, content: $runs(node.getChildren()), align: alignOf(node) });
    else if ($isQuoteNode(node)) blocks.push({ type: "quote", content: $runs(node.getChildren()) });
    else if ($isParagraphNode(node)) blocks.push({ type: "paragraph", content: $runs(node.getChildren()), align: alignOf(node) });
    else if ($isListNode(node)) {
      const items: ListItem[] = [];
      $listItems(node, 0, items);
      blocks.push({ type: "list", ordered: node.getListType() === "number", items });
    } else if ($isTableNode(node)) {
      const rows = node.getChildren().flatMap((row) => {
        if (!$isTableRowNode(row)) return [];
        const cells = row.getChildren().filter($isTableCellNode);
        const isHeader = cells.length > 0 && cells.every((cell) => cell.getHeaderStyles() !== TableCellHeaderStates.NO_STATUS);
        return [{ isHeader, cells: cells.map((cell) => cell.getChildren().flatMap((paragraph, index) => ($isElementNode(paragraph) ? [...(index > 0 ? [{ text: "\n" }] : []), ...$runs(paragraph.getChildren())] : []))) }];
      });
      blocks.push({ type: "table", rows });
    } else if ($isHorizontalRuleNode(node)) blocks.push({ type: "rule" });
    else if ($isPageBreakNode(node)) blocks.push({ type: "pagebreak" });
    else if ($isLayoutContainerNode(node)) for (const column of node.getChildren()) if ($isElementNode(column)) $blocks(column, blocks);
  }
}

export function $buildExportDoc(references: { title: string; url?: string }[]): ExportDoc {
  const blocks: Block[] = [];
  $blocks($getRoot(), blocks);
  const settings = $getPageSettings();
  const { width, height } = pageDimensions(settings);
  const { top, right, bottom, left } = resolveMargins(settings);
  const first = blocks.find((block) => block.type === "heading");
  const title = first && first.type === "heading" ? first.content.map((run) => run.text).join("").trim() : "";
  return { title: title || "Document", page: { width, height, top, right, bottom, left }, blocks, references: references.map((source, index) => ({ number: index + 1, title: source.title, url: source.url })) };
}
