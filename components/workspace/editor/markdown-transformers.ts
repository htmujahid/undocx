"use client"

import type { LexicalNode } from "lexical"
import { $isElementNode, $isParagraphNode, $isTextNode } from "lexical"

import {
  $createHorizontalRuleNode,
  $isHorizontalRuleNode,
  HorizontalRuleNode,
} from "@lexical/extension"
import type {
  ElementTransformer,
  MultilineElementTransformer,
  TextMatchTransformer,
  Transformer,
} from "@lexical/markdown"
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
} from "@lexical/markdown"
import type {
  TableCellNode as TableCellNodeType,
  TableNode as TableNodeType,
} from "@lexical/table"
import {
  $createTableCellNode,
  $createTableNode,
  $createTableRowNode,
  $isTableCellNode,
  $isTableNode,
  $isTableRowNode,
  TableCellHeaderStates,
  TableCellNode,
  TableNode,
  TableRowNode,
} from "@lexical/table"

import type { CalloutType } from "./callout-node"
import { $createCalloutNode, $isCalloutNode, CalloutNode } from "./callout-node"
import {
  $createFootnoteNode,
  $isFootnoteNode,
  FootnoteNode,
} from "./footnote-node"
import { $createMathNode, $isMathNode, MathNode } from "./math-node"
import {
  $createSelectionMarkerNode,
  $isSelectionMarkerNode,
  SelectionMarkerNode,
} from "./selection-marker-node"
import { $createSvgNode, $isSvgNode, SvgNode } from "./svg-node"

// Selection markers are ephemeral and never persisted in saved documents.

export const SELECTION_MARKER_START: ElementTransformer = {
  dependencies: [SelectionMarkerNode],
  export: (node) =>
    $isSelectionMarkerNode(node) && node.__role === "start"
      ? "<!-- @selection:start -->"
      : null,
  regExp: /^<!--\s*@selection:start\s*-->$/,
  replace: (parentNode, _children, _match, isImport) => {
    if (isImport) parentNode.replace($createSelectionMarkerNode("start"))
  },
  type: "element",
}

export const SELECTION_MARKER_END: ElementTransformer = {
  dependencies: [SelectionMarkerNode],
  export: (node) =>
    $isSelectionMarkerNode(node) && node.__role === "end"
      ? "<!-- @selection:end -->"
      : null,
  regExp: /^<!--\s*@selection:end\s*-->$/,
  replace: (parentNode, _children, _match, isImport) => {
    if (isImport) parentNode.replace($createSelectionMarkerNode("end"))
  },
  type: "element",
}

export const REMOVED_MARKER_START: ElementTransformer = {
  dependencies: [SelectionMarkerNode],
  export: (node) =>
    $isSelectionMarkerNode(node) && node.__role === "removed-start"
      ? "<!-- @removed:start -->"
      : null,
  regExp: /^<!--\s*@removed:start\s*-->$/,
  replace: (parentNode, _children, _match, isImport) => {
    if (isImport) parentNode.replace($createSelectionMarkerNode("removed-start"))
  },
  type: "element",
}

export const REMOVED_MARKER_END: ElementTransformer = {
  dependencies: [SelectionMarkerNode],
  export: (node) =>
    $isSelectionMarkerNode(node) && node.__role === "removed-end"
      ? "<!-- @removed:end -->"
      : null,
  regExp: /^<!--\s*@removed:end\s*-->$/,
  replace: (parentNode, _children, _match, isImport) => {
    if (isImport) parentNode.replace($createSelectionMarkerNode("removed-end"))
  },
  type: "element",
}

export const HR: ElementTransformer = {
  dependencies: [HorizontalRuleNode],
  export: (node) => ($isHorizontalRuleNode(node) ? "---" : null),
  regExp: /^(---|\*\*\*|___)\s?$/,
  replace: (parentNode, _children, _match, isImport) => {
    const line = $createHorizontalRuleNode()
    if (isImport || parentNode.getNextSibling() != null) {
      parentNode.replace(line)
    } else {
      parentNode.insertBefore(line)
    }
    line.selectNext()
  },
  type: "element",
}

export const CALLOUT: MultilineElementTransformer = {
  dependencies: [CalloutNode],
  export: (node, traverseChildren) => {
    if (!$isCalloutNode(node)) return null
    const content = node
      .getChildren()
      .map((child) => ($isElementNode(child) ? traverseChildren(child) : ""))
      .join("\n")
    return `:::${node.__calloutType}\n${content}\n:::`
  },
  regExpStart: /^:::(note|tip|warning|danger)\s*$/,
  regExpEnd: /^:::\s*$/,
  replace: (rootNode, children, startMatch, _endMatch, linesInBetween) => {
    const callout = $createCalloutNode(startMatch[1] as CalloutType)
    if (linesInBetween) {
      $convertFromMarkdownString(
        linesInBetween.join("\n").trim(),
        RENDERICAL_TRANSFORMERS,
        callout
      )
    } else if (children) {
      callout.append(...children)
    }
    rootNode.append(callout)
  },
  type: "multiline-element",
}

export const MATH_BLOCK: MultilineElementTransformer = {
  dependencies: [MathNode],
  export: (node) => {
    if (!$isMathNode(node) || node.__display !== "block") return null
    return `$$\n${node.__html}\n$$`
  },
  regExpStart: /^\$\$/,
  regExpEnd: /\$\$\s*$/,
  replace: (rootNode, _children, _startMatch, _endMatch, linesInBetween) => {
    const html = (linesInBetween ?? []).join("\n").trim()
    if (!html) return false
    rootNode.append($createMathNode(html, "block"))
  },
  type: "multiline-element",
}

export const MATH_INLINE: TextMatchTransformer = {
  dependencies: [MathNode],
  export: (node) => {
    if (!$isMathNode(node) || node.__display !== "inline") return null
    return `$${node.__html}$`
  },
  importRegExp: /\$(<math[\s\S]*?<\/math>|[^$\n]+)\$/,
  regExp: /\$(<math[\s\S]*?<\/math>|[^$\n]+)\$$/,
  replace: (textNode, match) => {
    textNode.replace($createMathNode(match[1], "inline"))
  },
  trigger: "$",
  type: "text-match",
}

export const FOOTNOTE: TextMatchTransformer = {
  dependencies: [FootnoteNode],
  export: (node) => {
    if (!$isFootnoteNode(node)) return null
    return `^[${node.__content}]`
  },
  importRegExp: /\^\[([^\]]+)\]/,
  regExp: /\^\[([^\]]+)\]$/,
  replace: (textNode, match) => {
    textNode.replace($createFootnoteNode(match[1]))
  },
  trigger: "]",
  type: "text-match",
}

export const SVG: MultilineElementTransformer = {
  dependencies: [SvgNode],
  export: (node) => ($isSvgNode(node) ? node.__html : null),
  regExpStart: /^<svg[\s>]/,
  regExpEnd: /<\/svg>\s*$/,
  replace: (rootNode, _children, startMatch, endMatch, linesInBetween) => {
    // linesInBetween excludes both matches, so stitch the full markup back.
    const html =
      startMatch[0] + (linesInBetween ?? []).join("\n") + (endMatch?.[0] ?? "")
    rootNode.append($createSvgNode(html.trim()))
  },
  type: "multiline-element",
}

// GFM table support, adapted from the Lexical playground.

const TABLE_ROW_REG_EXP = /^\|(.+)\|\s?$/
const TABLE_ROW_DIVIDER_REG_EXP = /^(\| ?:?-*:? ?)+\|\s*$/

function getTableColumnsSize(table: TableNodeType) {
  const row = table.getFirstChild()
  return $isTableRowNode(row) ? row.getChildrenSize() : 0
}

function $createTableCell(textContent: string): TableCellNodeType {
  const cell = $createTableCellNode(TableCellHeaderStates.NO_STATUS)
  $convertFromMarkdownString(
    textContent.replace(/\\n/g, "\n").trim(),
    RENDERICAL_TRANSFORMERS,
    cell
  )
  return cell
}

function mapToTableCells(textContent: string): TableCellNodeType[] | null {
  const match = textContent.match(TABLE_ROW_REG_EXP)
  if (!match || !match[1]) return null
  return match[1].split("|").map((text) => $createTableCell(text))
}

export const TABLE: ElementTransformer = {
  dependencies: [TableNode, TableRowNode, TableCellNode],
  export: (node: LexicalNode) => {
    if (!$isTableNode(node)) return null

    const output: string[] = []
    for (const row of node.getChildren()) {
      if (!$isTableRowNode(row)) continue

      const rowOutput: string[] = []
      let isHeaderRow = false
      for (const cell of row.getChildren()) {
        if ($isTableCellNode(cell)) {
          rowOutput.push(
            $convertToMarkdownString(RENDERICAL_TRANSFORMERS, cell)
              .replace(/\n/g, "\\n")
              .trim()
          )
          if (cell.__headerState === TableCellHeaderStates.ROW) {
            isHeaderRow = true
          }
        }
      }

      output.push(`| ${rowOutput.join(" | ")} |`)
      if (isHeaderRow) {
        output.push(`| ${rowOutput.map(() => "---").join(" | ")} |`)
      }
    }

    return output.join("\n")
  },
  regExp: TABLE_ROW_REG_EXP,
  replace: (parentNode, _children, match, isImport) => {
    // Divider row (`| --- | --- |`) marks the previous row as the header.
    if (TABLE_ROW_DIVIDER_REG_EXP.test(match[0])) {
      const table = parentNode.getPreviousSibling()
      if (!table || !$isTableNode(table)) return

      const rows = table.getChildren()
      const lastRow = rows[rows.length - 1]
      if (!lastRow || !$isTableRowNode(lastRow)) return

      lastRow.getChildren().forEach((cell) => {
        if (!$isTableCellNode(cell)) return
        cell.setHeaderStyles(
          TableCellHeaderStates.ROW,
          TableCellHeaderStates.ROW
        )
      })

      parentNode.remove()
      return
    }

    const matchCells = mapToTableCells(match[0])
    if (matchCells == null) return

    const rows = [matchCells]
    let sibling = parentNode.getPreviousSibling()
    let maxCells = matchCells.length

    // Pull preceding plain-text rows (not yet converted) into this table.
    while (sibling) {
      if (!$isParagraphNode(sibling) || sibling.getChildrenSize() !== 1) break

      const firstChild = sibling.getFirstChild()
      if (!$isTextNode(firstChild)) break

      const cells = mapToTableCells(firstChild.getTextContent())
      if (cells == null) break

      maxCells = Math.max(maxCells, cells.length)
      rows.unshift(cells)
      const previousSibling = sibling.getPreviousSibling()
      sibling.remove()
      sibling = previousSibling
    }

    const table = $createTableNode()
    for (const cells of rows) {
      const tableRow = $createTableRowNode()
      table.append(tableRow)
      for (let i = 0; i < maxCells; i++) {
        tableRow.append(i < cells.length ? cells[i] : $createTableCell(""))
      }
    }

    const previousSibling = parentNode.getPreviousSibling()
    if (
      $isTableNode(previousSibling) &&
      getTableColumnsSize(previousSibling) === maxCells
    ) {
      previousSibling.append(...table.getChildren())
      parentNode.remove()
    } else {
      parentNode.insertBefore(table)
      // During import the source paragraph must go immediately, otherwise it
      // sits between this table and the next row/divider line and prevents
      // them from finding the table as their previous sibling.
      if (isImport) {
        parentNode.remove()
      }
    }

    if (parentNode.isAttached()) {
      parentNode.selectEnd()
    }
  },
  type: "element",
}

// Custom transformers come first so they win over the defaults (e.g. an SVG or
// math block must not be swallowed by the paragraph/code fallbacks).
export const RENDERICAL_TRANSFORMERS: Transformer[] = [
  SELECTION_MARKER_START,
  SELECTION_MARKER_END,
  REMOVED_MARKER_START,
  REMOVED_MARKER_END,
  TABLE,
  HR,
  CALLOUT,
  MATH_BLOCK,
  SVG,
  MATH_INLINE,
  FOOTNOTE,
  ...TRANSFORMERS,
]
