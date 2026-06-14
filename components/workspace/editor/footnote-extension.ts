"use client"

import { $getRoot, $isElementNode, defineExtension } from "lexical"
import type { EditorState, LexicalNode } from "lexical"

import { FootnoteNode } from "./footnote-node"
import { publishFootnotes } from "./footnote-store"
import type { FootnoteInfo } from "./footnote-store"

function buildMap(state: EditorState): Map<string, FootnoteInfo> {
  return state.read(() => {
    const map = new Map<string, FootnoteInfo>()
    let i = 0

    function visit(node: LexicalNode) {
      if (node instanceof FootnoteNode) {
        map.set(node.__key, { index: ++i, content: node.__content })
      }
      if ($isElementNode(node)) {
        for (const child of node.getChildren()) visit(child)
      }
    }

    visit($getRoot())
    return map
  })
}

export const FootnoteExtension = defineExtension({
  name: "undocx/footnote",
  nodes: [FootnoteNode],
  register(editor) {
    publishFootnotes(editor, buildMap(editor.getEditorState()))
    return editor.registerUpdateListener(({ editorState }) => {
      publishFootnotes(editor, buildMap(editorState))
    })
  },
})
