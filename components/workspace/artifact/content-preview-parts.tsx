"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"

import { $getRoot } from "lexical"
import { useParams } from "next/navigation"
import { toast } from "sonner"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import {
  snapshotFootnotes,
  subscribeFootnotes,
} from "@/components/workspace/editor/footnote-store"
import {
  artifactQueryOptions,
  artifactsQueryOptions,
  updateArtifactMutationOptions,
} from "@/lib/data/artifacts"

function countWords(text: string): number {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length
}

export function WordCount() {
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

export function FootnoteList() {
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

export function EditableTitle({ title }: { title: string }) {
  const params = useParams<{ id: string; artifactId?: string }>()
  const workspaceId = params.id
  const artifactId = params.artifactId
  const editable = Boolean(artifactId)

  const qc = useQueryClient()
  const { mutate: saveTitle } = useMutation({
    ...updateArtifactMutationOptions,
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: artifactsQueryOptions(workspaceId).queryKey,
      })
      if (artifactId) {
        qc.invalidateQueries({
          queryKey: artifactQueryOptions(workspaceId, artifactId).queryKey,
        })
      }
    },
    onError: () => toast.error("Failed to rename document."),
  })

  const ref = useRef<HTMLTextAreaElement>(null)
  const [value, setValue] = useState(title)
  const [syncedTitle, setSyncedTitle] = useState(title)

  if (title !== syncedTitle) {
    setSyncedTitle(title)
    setValue(title)
  }

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  if (!editable) {
    return <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
  }

  function commit() {
    const next = value.trim()
    if (next === "" || next === title) {
      setValue(title)
      return
    }
    setValue(next)
    saveTitle({ workspaceId, id: artifactId!, title: next })
  }

  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      aria-label="Document title"
      placeholder="Untitled"
      spellCheck={false}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault()
          e.currentTarget.blur()
        } else if (e.key === "Escape") {
          setValue(title)
          e.currentTarget.blur()
        }
      }}
      className="-mx-1.5 w-full resize-none overflow-hidden rounded-md border-0 bg-transparent px-1.5 text-3xl font-bold tracking-tight outline-none transition-colors placeholder:text-muted-foreground hover:bg-muted/40 focus:bg-muted/40"
    />
  )
}
