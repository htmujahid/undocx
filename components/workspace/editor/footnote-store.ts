"use client"

import type { LexicalEditor } from "lexical"

export type FootnoteInfo = { index: number; content: string }

interface Store {
  map: Map<string, FootnoteInfo>
  listeners: Set<() => void>
}

const stores = new WeakMap<LexicalEditor, Store>()

function getStore(editor: LexicalEditor): Store {
  let store = stores.get(editor)
  if (!store) {
    store = { map: new Map(), listeners: new Set() }
    stores.set(editor, store)
  }
  return store
}

export function subscribeFootnotes(
  editor: LexicalEditor,
  cb: () => void
): () => void {
  const store = getStore(editor)
  store.listeners.add(cb)
  return () => store.listeners.delete(cb)
}

export function snapshotFootnotes(
  editor: LexicalEditor
): Map<string, FootnoteInfo> {
  return getStore(editor).map
}

export function publishFootnotes(
  editor: LexicalEditor,
  map: Map<string, FootnoteInfo>
): void {
  const store = getStore(editor)
  store.map = map
  store.listeners.forEach((cb) => cb())
}
