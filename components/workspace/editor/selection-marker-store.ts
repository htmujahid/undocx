"use client"

import type { LexicalEditor, NodeKey } from "lexical"

export interface SelectionMarkerState {
  startKey: NodeKey | null
  endKey: NodeKey | null
}

interface Store {
  state: SelectionMarkerState
  listeners: Set<() => void>
}

const stores = new WeakMap<LexicalEditor, Store>()

function getStore(editor: LexicalEditor): Store {
  let store = stores.get(editor)
  if (!store) {
    store = { state: { startKey: null, endKey: null }, listeners: new Set() }
    stores.set(editor, store)
  }
  return store
}

export function subscribeSelectionMarkers(
  editor: LexicalEditor,
  cb: () => void
): () => void {
  const store = getStore(editor)
  store.listeners.add(cb)
  return () => store.listeners.delete(cb)
}

export function snapshotSelectionMarkers(
  editor: LexicalEditor
): SelectionMarkerState {
  return getStore(editor).state
}

export function publishSelectionMarkers(
  editor: LexicalEditor,
  state: SelectionMarkerState
): void {
  const store = getStore(editor)
  if (
    store.state.startKey === state.startKey &&
    store.state.endKey === state.endKey
  )
    return
  store.state = state
  store.listeners.forEach((cb) => cb())
}
