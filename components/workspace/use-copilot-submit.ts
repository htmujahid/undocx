"use client"

import { useEffect, useRef, useSyncExternalStore } from "react"

import { experimental_useObject as useObject } from "@ai-sdk/react"
import { toast } from "sonner"

import { $convertFromMarkdownString, $convertToMarkdownString } from "@lexical/markdown"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { insertOutputSchema, replaceOutputSchema } from "@/lib/ai-schema"
import {
  artifactQueryOptions,
  artifactsQueryOptions,
  updateArtifactMutationOptions,
} from "@/lib/data/artifacts"

import { RENDERICAL_TRANSFORMERS } from "./editor/markdown-transformers"
import {
  snapshotSelectionMarkers,
  subscribeSelectionMarkers,
} from "./editor/selection-marker-store"

const START_PLACEHOLDER = "<!-- @selection:start -->"
const END_PLACEHOLDER = "<!-- @selection:end -->"

function splitAtMarkers(md: string): {
  before: string
  selected: string
  after: string
  hasStart: boolean
  hasEnd: boolean
} {
  const startIdx = md.indexOf(START_PLACEHOLDER)
  const endIdx = md.indexOf(END_PLACEHOLDER)

  if (startIdx === -1)
    return { before: md, selected: "", after: "", hasStart: false, hasEnd: false }

  const before = md.slice(0, startIdx).trim()

  if (endIdx === -1 || endIdx < startIdx) {
    const after = md.slice(startIdx + START_PLACEHOLDER.length).trim()
    return { before, selected: "", after, hasStart: true, hasEnd: false }
  }

  const selected = md.slice(startIdx + START_PLACEHOLDER.length, endIdx).trim()
  const after = md.slice(endIdx + END_PLACEHOLDER.length).trim()
  return { before, selected, after, hasStart: true, hasEnd: true }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export interface CopilotSubmitState {
  hasStart: boolean
  hasEnd: boolean
  hasBoth: boolean
  disabled: boolean
  isLoading: boolean
  loadingLabel: string
  placeholder: string
  submitLabel: string
  handleSubmit: (prompt: string) => void
}

export function useCopilotSubmit({
  workspaceId,
  artifactId,
}: {
  workspaceId: string
  artifactId: string
}): CopilotSubmitState {
  const qc = useQueryClient()
  const [editor] = useLexicalComposerContext()

  // ── Marker state ────────────────────────────────────────────────────────────
  const { startKey, endKey } = useSyncExternalStore(
    (cb) => subscribeSelectionMarkers(editor, cb),
    () => snapshotSelectionMarkers(editor),
    () => ({ startKey: null, endKey: null })
  )
  const hasStart = startKey !== null
  const hasEnd = endKey !== null
  const hasBoth = hasStart && hasEnd
  const disabled = !hasStart && !hasEnd

  // ── Snapshot captured at submit time ─────────────────────────────────────────
  const snapshotRef = useRef<{
    existing: string
    before: string
    selected: string
    after: string
  }>({ existing: "", before: "", selected: "", after: "" })

  // ── Save mutation ─────────────────────────────────────────────────────────────
  const saveMutation = useMutation({
    ...updateArtifactMutationOptions,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: artifactsQueryOptions(workspaceId).queryKey })
      qc.invalidateQueries({
        queryKey: artifactQueryOptions(workspaceId, artifactId).queryKey,
      })
    },
    onError: () => toast.error("Failed to save."),
  })

  // ── Editor helpers ─────────────────────────────────────────────────────────
  const getMarkdown = (): string => {
    let md = ""
    editor.getEditorState().read(() => {
      md = $convertToMarkdownString(RENDERICAL_TRANSFORMERS)
    })
    return md
  }

  const applyMarkdown = (md: string) => {
    editor.update(() => {
      $convertFromMarkdownString(md, RENDERICAL_TRANSFORMERS)
    })
  }

  // ── INSERT mode (start marker only) ──────────────────────────────────────────

  const insertObj = useObject({
    api: "/api/chat/insert",
    schema: insertOutputSchema,
    onFinish: ({ object: result, error }) => {
      if (error || !result) {
        applyMarkdown(snapshotRef.current.existing)
        toast.error("Generation failed. Please try again.")
        return
      }
      try {
        const { before, after } = snapshotRef.current
        const final = [before, result.content, after].filter(Boolean).join("\n\n")
        applyMarkdown(final)
        saveMutation.mutate({ workspaceId, id: artifactId, content: final })
      } catch (err) {
        toast.error("Failed to apply content.")
        console.error("[Insert]", err)
      }
    },
    onError: (err: Error) => {
      applyMarkdown(snapshotRef.current.existing)
      toast.error("Generation failed.")
      console.error("[Insert]", err)
    },
  })

  useEffect(() => {
    if (!insertObj.isLoading) return
    const newContent = insertObj.object?.content
    if (!newContent) return
    const cut = newContent.lastIndexOf("\n\n")
    const partial = cut > 0 ? newContent.slice(0, cut) : newContent
    const { before, after } = snapshotRef.current
    applyMarkdown([before, partial, after].filter(Boolean).join("\n\n"))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insertObj.object])

  // ── REPLACE mode (both markers) ───────────────────────────────────────────────

  const replaceObj = useObject({
    api: "/api/chat/replace",
    schema: replaceOutputSchema,
    onFinish: ({ object: result, error }) => {
      if (error || !result) {
        applyMarkdown(snapshotRef.current.existing)
        toast.error("Generation failed. Please try again.")
        return
      }
      try {
        const { before, after } = snapshotRef.current
        const final = [before, result.content, after].filter(Boolean).join("\n\n")
        applyMarkdown(final)
        saveMutation.mutate({ workspaceId, id: artifactId, content: final })
      } catch (err) {
        toast.error("Failed to apply content.")
        console.error("[Replace]", err)
      }
    },
    onError: (err: Error) => {
      applyMarkdown(snapshotRef.current.existing)
      toast.error("Generation failed.")
      console.error("[Replace]", err)
    },
  })

  useEffect(() => {
    if (!replaceObj.isLoading) return
    const newContent = replaceObj.object?.content
    if (!newContent) return
    const cut = newContent.lastIndexOf("\n\n")
    const partial = cut > 0 ? newContent.slice(0, cut) : newContent
    const { before, after } = snapshotRef.current
    applyMarkdown([before, partial, after].filter(Boolean).join("\n\n"))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replaceObj.object])

  // ── Submit ─────────────────────────────────────────────────────────────────────

  const isLoading = insertObj.isLoading || replaceObj.isLoading

  const handleSubmit = (prompt: string) => {
    const text = prompt.trim()
    if (!text || isLoading || disabled) return

    const fullMarkdown = getMarkdown()
    const { before, selected, after, hasStart: hs, hasEnd: he } =
      splitAtMarkers(fullMarkdown)

    snapshotRef.current = { existing: fullMarkdown, before, selected, after }

    if (hs && he) {
      replaceObj.submit({ beforeContent: before, selectedContent: selected, afterContent: after, prompt: text })
    } else if (hs) {
      insertObj.submit({ beforeContent: before, afterContent: after, prompt: text })
    }
  }

  // ── Derived labels ─────────────────────────────────────────────────────────────

  const loadingLabel = hasBoth ? "Replacing…" : "Inserting…"
  const placeholder = hasBoth
    ? "Describe how to rewrite the selected section…"
    : "Describe what to insert at the marker…"
  const submitLabel = hasBoth ? "to replace" : "to insert"

  return {
    hasStart,
    hasEnd,
    hasBoth,
    disabled,
    isLoading,
    loadingLabel,
    placeholder,
    submitLabel,
    handleSubmit,
  }
}
