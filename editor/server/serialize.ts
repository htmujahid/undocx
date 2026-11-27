import "server-only";

import { $createHorizontalRuleNode, HorizontalRuleNode } from "@lexical/extension";
import { createHeadlessEditor } from "@lexical/headless";
import { $createMarkNode, MarkNode } from "@lexical/mark";
import { $createListItemNode, $createListNode, ListItemNode, ListNode, type ListType } from "@lexical/list";
import { $createHeadingNode, $createQuoteNode, HeadingNode, QuoteNode, type HeadingTagType } from "@lexical/rich-text";
import { $createTableCellNode, $createTableNode, $createTableRowNode, TableCellHeaderStates, TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { $createParagraphNode, $createTextNode, $getRoot, type ElementFormatType, type ElementNode, type LexicalNode, type TextFormatType } from "lexical";
import { $createCitationNode, CitationNode } from "../nodes/citation-node";
import { $createLayoutContainerNode, LayoutContainerNode } from "../nodes/layout-container-node";
import { $createLayoutItemNode, LayoutItemNode } from "../nodes/layout-item-node";

export type SeedRun = { text: string; format?: TextFormatType[]; note?: string; cite?: string };
export type SeedItem = { text: string; checked?: boolean };
export type SeedBlock =
  | { type: "heading"; tag: HeadingTagType; text: string; align?: ElementFormatType }
  | { type: "paragraph"; runs: SeedRun[]; align?: ElementFormatType }
  | { type: "quote"; text: string }
  | { type: "list"; listType: ListType; items: SeedItem[] }
  | { type: "rule" }
  | { type: "table"; header: string[]; rows: string[][] }
  | { type: "layout"; columns: SeedBlock[][] };

function $createBlock(block: SeedBlock): LexicalNode {
  switch (block.type) {
    case "heading": {
      const heading = $createHeadingNode(block.tag).append($createTextNode(block.text));
      if (block.align) heading.setFormat(block.align);
      return heading;
    }
    case "quote":
      return $createQuoteNode().append($createTextNode(block.text));
    case "rule":
      return $createHorizontalRuleNode();
    case "list": {
      const list = $createListNode(block.listType);
      for (const item of block.items) {
        list.append($createListItemNode(block.listType === "check" ? (item.checked ?? false) : undefined).append($createTextNode(item.text)));
      }
      return list;
    }
    case "table": {
      const table = $createTableNode();
      const rows = [{ cells: block.header, header: TableCellHeaderStates.ROW }, ...block.rows.map((cells) => ({ cells, header: TableCellHeaderStates.NO_STATUS }))];
      for (const { cells, header } of rows) {
        const row = $createTableRowNode();
        for (const text of cells) row.append($createTableCellNode(header).append($createParagraphNode().append($createTextNode(text))));
        table.append(row);
      }
      return table;
    }
    case "layout": {
      const container = $createLayoutContainerNode(block.columns.map(() => "1fr").join(" "));
      for (const column of block.columns) container.append($appendBlocks($createLayoutItemNode(), column));
      return container;
    }
    default: {
      const paragraph = $createParagraphNode();
      for (const run of block.runs) {
        const node = $createTextNode(run.text);
        for (const format of run.format ?? []) node.toggleFormat(format);
        paragraph.append(run.note ? $createMarkNode([run.note]).append(node) : node);
        if (run.cite) paragraph.append($createCitationNode(run.cite));
      }
      if (block.align) paragraph.setFormat(block.align);
      return paragraph;
    }
  }
}

function $appendBlocks<T extends ElementNode>(parent: T, blocks: SeedBlock[]): T {
  for (const block of blocks) parent.append($createBlock(block));
  return parent;
}

export function serializeBlocks(blocks: SeedBlock[]): string {
  const editor = createHeadlessEditor({
    namespace: "undocx",
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, HorizontalRuleNode, TableNode, TableRowNode, TableCellNode, LayoutContainerNode, LayoutItemNode, MarkNode, CitationNode],
    onError: (error) => {
      throw error;
    },
  });
  editor.update(() => $appendBlocks($getRoot(), blocks), { discrete: true });
  return JSON.stringify(editor.getEditorState().toJSON());
}
