"use client"

import { useEffect, useRef, useState } from "react"

import { experimental_useObject as useObject } from "@ai-sdk/react"
import { $getRoot } from "lexical"
import { toast } from "sonner"

import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
} from "@lexical/markdown"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { UNDOCX_TRANSFORMERS } from "@/components/workspace/editor/markdown-transformers"
import { $isSelectionMarkerNode } from "@/components/workspace/editor/selection-marker-node"
import { insertOutputSchema, replaceOutputSchema } from "@/lib/ai/ai-schema"
import { useSelectionMarkers } from "@/components/workspace/editor/use-selection-markers"
import {
  artifactQueryOptions,
  artifactsQueryOptions,
  updateArtifactMutationOptions,
} from "@/lib/data/artifacts"

const START_PLACEHOLDER = "<!-- @selection:start -->"
const END_PLACEHOLDER = "<!-- @selection:end -->"
const REMOVED_START_PLACEHOLDER = "<!-- @removed:start -->"
const REMOVED_END_PLACEHOLDER = "<!-- @removed:end -->"

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

export interface AssistantSubmitState {
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

export function useAssistantSubmit({
  workspaceId,
  artifactId,
  contextIds,
}: {
  workspaceId: string
  artifactId: string
  contextIds?: Set<string>
}): AssistantSubmitState {
  const qc = useQueryClient()
  const [editor] = useLexicalComposerContext()

  const { hasStart, hasEnd, hasBoth } = useSelectionMarkers()
  const disabled = !hasStart && !hasEnd

  const snapshotRef = useRef<{
    existing: string
    before: string
    selected: string
    after: string
  }>({ existing: "", before: "", selected: "", after: "" })

  const [pending, setPending] = useState<{
    mode: "insert" | "replace"
    final: string
    addedKeys: string[]
    removedKeys: string[]
  } | null>(null)

  useEffect(() => {
    if (!pending) return
    const apply = () => {
      for (const key of pending.addedKeys)
        editor
          .getElementByKey(key)
          ?.classList.add("assistant-pending-highlight")
      for (const key of pending.removedKeys)
        editor
          .getElementByKey(key)
          ?.classList.add("assistant-removed-highlight")
    }
    apply()
    const unregister = editor.registerUpdateListener(apply)
    return () => {
      unregister()
      for (const key of pending.addedKeys)
        editor
          .getElementByKey(key)
          ?.classList.remove("assistant-pending-highlight")
      for (const key of pending.removedKeys)
        editor
          .getElementByKey(key)
          ?.classList.remove("assistant-removed-highlight")
    }
  }, [pending, editor])

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

  const getMarkdown = (): string => {
    let md = ""
    editor.getEditorState().read(() => {
      md = $convertToMarkdownString(UNDOCX_TRANSFORMERS)
    })
    return md
  }

  const applyMarkdown = (md: string) => {
    editor.update(() => {
      $convertFromMarkdownString(md, UNDOCX_TRANSFORMERS)
    })
  }

  const applyPendingMarkdown = (
    before: string,
    content: string,
    after: string,
    removedContent?: string
  ): { addedKeys: string[]; removedKeys: string[] } => {
    const addedKeys: string[] = []
    const removedKeys: string[] = []
    editor.update(() => {
      const parts: string[] = []
      if (before) parts.push(before)
      if (removedContent) {
        parts.push(
          REMOVED_START_PLACEHOLDER,
          removedContent,
          REMOVED_END_PLACEHOLDER
        )
      }
      parts.push(START_PLACEHOLDER, content, END_PLACEHOLDER)
      if (after) parts.push(after)
      $convertFromMarkdownString(parts.join("\n\n"), UNDOCX_TRANSFORMERS)

      const children = $getRoot().getChildren()

      const removedStart = children.find(
        (n) => $isSelectionMarkerNode(n) && n.__role === "removed-start"
      )
      const removedEnd = children.find(
        (n) => $isSelectionMarkerNode(n) && n.__role === "removed-end"
      )
      const start = children.find(
        (n) => $isSelectionMarkerNode(n) && n.__role === "start"
      )
      const end = children.find(
        (n) => $isSelectionMarkerNode(n) && n.__role === "end"
      )

      if (removedStart && removedEnd) {
        let node = removedStart.getNextSibling()
        while (node && node !== removedEnd) {
          removedKeys.push(node.getKey())
          node = node.getNextSibling()
        }
        removedStart.remove()
        removedEnd.remove()
      }

      if (start && end) {
        let node = start.getNextSibling()
        while (node && node !== end) {
          addedKeys.push(node.getKey())
          node = node.getNextSibling()
        }
        start.remove()
        end.remove()
      }
    })
    return { addedKeys, removedKeys }
  }

  const insertObj = useObject({
    api: "/api/assistant/insert",
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
        const { addedKeys, removedKeys } = applyPendingMarkdown(
          before,
          result.content,
          after
        )
        setPending({ mode: "insert", final, addedKeys, removedKeys })
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

  const replaceObj = useObject({
    api: "/api/assistant/replace",
    schema: replaceOutputSchema,
    onFinish: ({ object: result, error }) => {
      if (error || !result) {
        applyMarkdown(snapshotRef.current.existing)
        toast.error("Generation failed. Please try again.")
        return
      }
      try {
        const { before, selected, after } = snapshotRef.current
        const final = [before, result.content, after]
          .filter(Boolean)
          .join("\n\n")
        const { addedKeys, removedKeys } = applyPendingMarkdown(
          before,
          result.content,
          after,
          selected
        )
        setPending({ mode: "replace", final, addedKeys, removedKeys })
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

  const isLoading = insertObj.isLoading || replaceObj.isLoading

  const handleSubmit = (prompt: string) => {
    const text = prompt.trim()
    if (!text || isLoading || disabled || pending) return

    const ids = [...(contextIds ?? [])]

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
        workspaceId,
        contextIds: ids,
        beforeContent: before,
        selectedContent: selected,
        afterContent: after,
        prompt: text,
      })
    } else if (hs) {
      insertObj.submit({
        workspaceId,
        contextIds: ids,
        beforeContent: before,
        afterContent: after,
        prompt: text,
      })
    }
  }

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
