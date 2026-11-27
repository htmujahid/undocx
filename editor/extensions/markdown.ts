import { $createHorizontalRuleNode, $isHorizontalRuleNode, HorizontalRuleNode } from "@lexical/extension";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  CHECK_LIST,
  ELEMENT_TRANSFORMERS,
  isTableRowDivider,
  registerMarkdownShortcuts,
  TEXT_FORMAT_TRANSFORMERS,
  TEXT_MATCH_TRANSFORMERS,
  type ElementTransformer,
  type TextMatchTransformer,
  type Transformer,
} from "@lexical/markdown";
import { $createTableCellNode, $createTableNode, $createTableRowNode, $isTableCellNode, $isTableNode, $isTableRowNode, TableCellHeaderStates, TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { $createParagraphNode, $isParagraphNode, $isTextNode, defineExtension, type ElementNode, type LexicalNode } from "lexical";
import { $citationNumber, $isCitationNode, CitationNode } from "../nodes/citation-node";
import { $createLayoutContainerNode, $isLayoutContainerNode, LayoutContainerNode } from "../nodes/layout-container-node";
import { $createLayoutItemNode, $isLayoutItemNode, LayoutItemNode } from "../nodes/layout-item-node";

export const HORIZONTAL_RULE: ElementTransformer = {
  type: "element",
  dependencies: [HorizontalRuleNode],
  export: (node) => ($isHorizontalRuleNode(node) ? "***" : null),
  regExp: /^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/,
  triggerOnEnter: true,
  replace: (parentNode, _children, _match, isImport) => {
    const line = $createHorizontalRuleNode();
    if (isImport || parentNode.getNextSibling() != null) parentNode.replace(line);
    else parentNode.insertBefore(line);
    line.selectNext();
  },
};

const TABLE_ROW_REG_EXP = /^\|(?!\|\|)(.+)\|$/;
const LAYOUT_ROW_REG_EXP = /^\|\|\|(.+)\|\|\|$/;

function tableColumnCount(table: TableNode) {
  const row = table.getFirstChild();
  return $isTableRowNode(row) ? row.getChildrenSize() : 0;
}

function $createCell(text: string): TableCellNode {
  const cell = $createTableCellNode(TableCellHeaderStates.NO_STATUS);
  $convertFromMarkdownString(text.replace(/\\n/g, "\n").trim(), markdownTransformers, cell);
  return cell;
}

function cellsFromRow(text: string): TableCellNode[] | null {
  const match = text.match(TABLE_ROW_REG_EXP);
  if (!match || !match[1]) return null;
  return match[1].split("|").map((cell) => $createCell(cell));
}

export const TABLE: ElementTransformer = {
  type: "element",
  dependencies: [TableNode, TableRowNode, TableCellNode],
  export: (node: LexicalNode) => {
    if (!$isTableNode(node)) return null;
    const output: string[] = [];
    for (const row of node.getChildren()) {
      if (!$isTableRowNode(row)) continue;
      const cells: string[] = [];
      let isHeaderRow = false;
      for (const cell of row.getChildren()) {
        if (!$isTableCellNode(cell)) continue;
        cells.push($convertToMarkdownString(markdownTransformers, cell).replace(/\n/g, "\\n").trim());
        if (cell.hasHeaderState(TableCellHeaderStates.ROW)) isHeaderRow = true;
      }
      output.push(`| ${cells.join(" | ")} |`);
      if (isHeaderRow) output.push(`| ${cells.map(() => "---").join(" | ")} |`);
    }
    return output.join("\n");
  },
  regExp: TABLE_ROW_REG_EXP,
  triggerOnEnter: true,
  replace: (parentNode, _children, match, isImport) => {
    const settle = (table: ElementNode) => {
      if (isImport) {
        parentNode.remove();
        return;
      }
      if (parentNode.isAttached()) parentNode.selectStart();
      else {
        const paragraph = $createParagraphNode();
        table.insertAfter(paragraph);
        paragraph.selectStart();
      }
    };
    if (isTableRowDivider(match[0])) {
      const table = parentNode.getPreviousSibling();
      if (!$isTableNode(table)) return;
      const lastRow = table.getLastChild();
      if (!$isTableRowNode(lastRow)) return;
      for (const cell of lastRow.getChildren()) {
        if ($isTableCellNode(cell)) cell.setHeaderStyles(TableCellHeaderStates.ROW, TableCellHeaderStates.ROW);
      }
      settle(table);
      return;
    }
    const firstCells = cellsFromRow(match[0]);
    if (!firstCells) return;
    const rows = [firstCells];
    let maxCells = firstCells.length;
    let sibling = parentNode.getPreviousSibling();
    while ($isParagraphNode(sibling) && sibling.getChildrenSize() === 1) {
      const child = sibling.getFirstChild();
      if (!$isTextNode(child)) break;
      const cells = cellsFromRow(child.getTextContent());
      if (!cells) break;
      maxCells = Math.max(maxCells, cells.length);
      rows.unshift(cells);
      const previous = sibling.getPreviousSibling();
      sibling.remove();
      sibling = previous;
    }
    const table = $createTableNode();
    for (const cells of rows) {
      const row = $createTableRowNode();
      for (let i = 0; i < maxCells; i++) row.append(cells[i] ?? $createCell(""));
      table.append(row);
    }
    const previous = parentNode.getPreviousSibling();
    if ($isTableNode(previous) && tableColumnCount(previous) === maxCells) {
      previous.append(...table.getChildren());
      settle(previous);
    } else {
      parentNode.insertBefore(table);
      settle(table);
    }
  },
};

function tableCell(markdown: string) {
  return markdown
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) =>
      line
        .replace(/^#{1,6}\s+(.*)$/, "**$1**")
        .replace(/^[-*+]\s+/, "• ")
        .replace(/^>\s?/, "")
        .replace(/\|/g, "\\|"),
    )
    .join("<br>");
}

export const LAYOUT: ElementTransformer = {
  type: "element",
  dependencies: [LayoutContainerNode, LayoutItemNode],
  export: (node: LexicalNode) => {
    if (!$isLayoutContainerNode(node)) return null;
    const cells = node
      .getChildren()
      .filter($isLayoutItemNode)
      .map((item) => tableCell($convertToMarkdownString(markdownTransformers, item)));
    if (cells.length === 0) return null;
    return `| ${cells.join(" | ")} |\n| ${cells.map(() => "---").join(" | ")} |`;
  },
  regExp: LAYOUT_ROW_REG_EXP,
  triggerOnEnter: true,
  replace: (parentNode, _children, match, isImport) => {
    const columns = match[1].split("|||").map((column) => column.replace(/\\n/g, "\n").trim());
    if (columns.length < 2) return false;
    const container = $createLayoutContainerNode(columns.map(() => "1fr").join(" "));
    for (const column of columns) {
      const item = $createLayoutItemNode();
      $convertFromMarkdownString(column, markdownTransformers, item);
      if (item.isEmpty()) item.append($createParagraphNode());
      container.append(item);
    }
    if (isImport) {
      parentNode.replace(container);
      return;
    }
    parentNode.insertBefore(container);
    parentNode.selectStart();
  },
};

const CITATION: TextMatchTransformer = {
  type: "text-match",
  dependencies: [CitationNode],
  export: (node) => ($isCitationNode(node) ? `[${$citationNumber(node)}]` : null),
  regExp: /(?!)/,
};

export const markdownTransformers: Transformer[] = [CITATION, LAYOUT, TABLE, HORIZONTAL_RULE, CHECK_LIST, ...ELEMENT_TRANSFORMERS, ...TEXT_FORMAT_TRANSFORMERS, ...TEXT_MATCH_TRANSFORMERS];

export const MarkdownExtension = defineExtension({
  name: "undocx/Markdown",
  register: (editor) => registerMarkdownShortcuts(editor, markdownTransformers),
});

export function $exportMarkdown() {
  return $convertToMarkdownString(markdownTransformers, undefined, true);
}
