"use client"

import { useSyncExternalStore } from "react"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"

import {
  snapshotSelectionMarkers,
  subscribeSelectionMarkers,
} from "@/components/workspace/editor/selection-marker-store"

export function useSelectionMarkers() {
  const [editor] = useLexicalComposerContext()

  const { startKey, endKey } = useSyncExternalStore(
    (cb) => subscribeSelectionMarkers(editor, cb),
    () => snapshotSelectionMarkers(editor),
    () => ({ startKey: null, endKey: null })
  )

  const hasStart = startKey !== null
  const hasEnd = endKey !== null
  const hasBoth = hasStart && hasEnd

  return { hasStart, hasEnd, hasBoth }
}
