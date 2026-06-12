"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"

import { experimental_useObject as useObject } from "@ai-sdk/react"
import { toast } from "sonner"

import { $getRoot } from "lexical"

import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
} from "@lexical/markdown"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { insertOutputSchema, replaceOutputSchema } from "@/lib/ai-schema"
import {
  artifactQueryOptions,
  artifactsQueryOptions,
  fetchContextDocuments,
  updateArtifactMutationOptions,
} from "@/lib/data/artifacts"

import { RENDERICAL_TRANSFORMERS } from "./editor/markdown-transformers"
import { $isSelectionMarkerNode } from "./editor/selection-marker-node"
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
    return {
      before: md,
      selected: "",
      after: "",
      hasStart: false,
      hasEnd: false,
    }

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
  isSaving: boolean
  loadingLabel: string
  placeholder: string
  submitLabel: string
  handleSubmit: (prompt: string) => void
  pendingMode: "insert" | "replace" | null
  acceptPending: () => void
  rejectPending: () => void
}

export function useCopilotSubmit({
  workspaceId,
  artifactId,
  contextIds,
}: {
  workspaceId: string
  artifactId: string
  contextIds?: Set<string>
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

  // ── Pending review (generated content awaiting accept/reject) ───────────────
  const [pending, setPending] = useState<{
    mode: "insert" | "replace"
    final: string
    keys: string[]
  } | null>(null)

  // Highlight the generated blocks while they await accept/reject. Classes are
  // re-applied after every reconcile since Lexical may recreate the DOM nodes.
  useEffect(() => {
    if (!pending) return
    const apply = () => {
      for (const key of pending.keys)
        editor.getElementByKey(key)?.classList.add("copilot-pending-highlight")
    }
    apply()
    const unregister = editor.registerUpdateListener(apply)
    return () => {
      unregister()
      for (const key of pending.keys)
        editor
          .getElementByKey(key)
          ?.classList.remove("copilot-pending-highlight")
    }
  }, [pending, editor])

  // ── Save mutation ─────────────────────────────────────────────────────────────
  const saveMutation = useMutation({
    ...updateArtifactMutationOptions,
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: artifactsQueryOptions(workspaceId).queryKey,
      })
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

  // Applies the final document but wraps the generated content in selection
  // placeholders first, so the blocks between them can be identified for the
  // review highlight. The markers are removed again within the same update.
  const applyPendingMarkdown = (
    before: string,
    content: string,
    after: string
  ): string[] => {
    const keys: string[] = []
    editor.update(() => {
      const md = [before, START_PLACEHOLDER, content, END_PLACEHOLDER, after]
        .filter(Boolean)
        .join("\n\n")
      $convertFromMarkdownString(md, RENDERICAL_TRANSFORMERS)

      const children = $getRoot().getChildren()
      const start = children.find(
        (n) => $isSelectionMarkerNode(n) && n.__role === "start"
      )
      const end = children.find(
        (n) => $isSelectionMarkerNode(n) && n.__role === "end"
      )
      if (!start || !end) return

      let node = start.getNextSibling()
      while (node && node !== end) {
        keys.push(node.getKey())
        node = node.getNextSibling()
      }
      start.remove()
      end.remove()
    })
    return keys
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
        const final = [before, result.content, after]
          .filter(Boolean)
          .join("\n\n")
        const keys = applyPendingMarkdown(before, result.content, after)
        setPending({ mode: "insert", final, keys })
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
        const final = [before, result.content, after]
          .filter(Boolean)
          .join("\n\n")
        const keys = applyPendingMarkdown(before, result.content, after)
        setPending({ mode: "replace", final, keys })
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

  // ── Accept / Reject ──────────────────────────────────────────────────────────

  const acceptPending = () => {
    if (!pending) return
    saveMutation.mutate({
      workspaceId,
      id: artifactId,
      content: pending.final,
    })
    setPending(null)
  }

  const rejectPending = () => {
    if (!pending) return
    applyMarkdown(snapshotRef.current.existing)
    setPending(null)
  }

  // ── Submit ─────────────────────────────────────────────────────────────────────

  const isLoading = insertObj.isLoading || replaceObj.isLoading

  const handleSubmit = async (prompt: string) => {
    const text = prompt.trim()
    if (!text || isLoading || disabled || pending) return

    let context
    try {
      context = await fetchContextDocuments(
        qc,
        workspaceId,
        contextIds ?? new Set()
      )
    } catch {
      toast.error("Failed to load context artifacts.")
      return
    }

    const fullMarkdown = getMarkdown()
    const {
      before,
      selected,
      after,
      hasStart: hs,
      hasEnd: he,
    } = splitAtMarkers(fullMarkdown)

    snapshotRef.current = { existing: fullMarkdown, before, selected, after }

    if (hs && he) {
      replaceObj.submit({
        beforeContent: before,
        selectedContent: selected,
        afterContent: after,
        prompt: text,
        context,
      })
    } else if (hs) {
      insertObj.submit({
        beforeContent: before,
        afterContent: after,
        prompt: text,
        context,
      })
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
    isSaving: saveMutation.isPending,
    loadingLabel,
    placeholder,
    submitLabel,
    handleSubmit,
    pendingMode: pending?.mode ?? null,
    acceptPending,
    rejectPending,
  }
}
