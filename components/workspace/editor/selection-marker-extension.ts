"use client"

import { $getRoot, $isElementNode, defineExtension } from "lexical"
import type { EditorState, LexicalNode } from "lexical"

import { SelectionMarkerNode } from "./selection-marker-node"
import { publishSelectionMarkers } from "./selection-marker-store"

function findMarkerKeys(state: EditorState): {
  startKey: string | null
  endKey: string | null
} {
  return state.read(() => {
    let startKey: string | null = null
    let endKey: string | null = null

    function walk(node: LexicalNode) {
      if (node instanceof SelectionMarkerNode) {
        if (node.__role === "start") startKey = node.__key
        else endKey = node.__key
        return
      }
      if ($isElementNode(node)) {
        for (const child of node.getChildren()) walk(child)
      }
    }

    walk($getRoot())
    return { startKey, endKey }
  })
}

export const SelectionMarkerExtension = defineExtension({
  name: "renderical/selection-marker",
  nodes: [SelectionMarkerNode],
  register(editor) {
    publishSelectionMarkers(editor, findMarkerKeys(editor.getEditorState()))
    return editor.registerUpdateListener(({ editorState }) => {
      publishSelectionMarkers(editor, findMarkerKeys(editorState))
    })
  },
})
