"use client"

import { useEffect, useState, useSyncExternalStore } from "react"

import { $getRoot } from "lexical"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { ContentEditable } from "@lexical/react/LexicalContentEditable"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  snapshotFootnotes,
  subscribeFootnotes,
} from "@/components/workspace/editor/footnote-store"

function countWords(text: string): number {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length
}

function WordCount() {
  const [editor] = useLexicalComposerContext()
  const [count, setCount] = useState(0)

  useEffect(() => {
    editor.getEditorState().read(() => {
      setCount(countWords($getRoot().getTextContent()))
    })
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        setCount(countWords($getRoot().getTextContent()))
      })
    })
  }, [editor])

  return <span>{count.toLocaleString()} words</span>
}

const EMPTY_FOOTNOTE_MAP = new Map()

function FootnoteList() {
  const [editor] = useLexicalComposerContext()
  const map = useSyncExternalStore(
    (cb) => subscribeFootnotes(editor, cb),
    () => snapshotFootnotes(editor),
    () => EMPTY_FOOTNOTE_MAP
  )
  const entries = Array.from(map.values()).sort((a, b) => a.index - b.index)

  if (entries.length === 0) return null

  return (
    <div className="mt-8 border-t pt-6">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        References
      </p>
      <ol className="space-y-2">
        {entries.map((f) => (
          <li
            key={f.index}
            id={`fn-${f.index}`}
            className="flex gap-2.5 text-xs text-muted-foreground"
          >
            <span className="shrink-0 font-mono font-medium text-foreground">
              [{f.index}]
            </span>
            <span className="leading-relaxed">{f.content}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

export function ContentPreview({ title }: { title: string }) {
  return (
    <div className="min-h-0 flex-1 overflow-hidden">
      <ScrollArea className="h-full">
        <div className="mx-auto max-w-[720px] px-8 py-8">
          <div className="mb-6">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Generated document
            </p>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
              <WordCount />
              <span>·</span>
              <span>Just now</span>
            </div>
          </div>

          <Separator className="mb-6" />

          <ContentEditable className="space-y-3 outline-none" />

          <FootnoteList />
        </div>
      </ScrollArea>
    </div>
  )
}
