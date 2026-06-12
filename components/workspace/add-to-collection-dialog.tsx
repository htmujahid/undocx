"use client"

import { useState } from "react"

import { CheckIcon } from "lucide-react"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  type ArtifactSummary,
  updateArtifactMutationOptions,
} from "@/lib/data/artifacts"
import { collectionsQueryOptions } from "@/lib/data/collections"

export function AddToCollectionDialog({
  open,
  workspaceId,
  artifact,
  onClose,
}: {
  open: boolean
  workspaceId: string
  artifact: ArtifactSummary | null
  onClose: () => void
}) {
  const qc = useQueryClient()
  const { data: collections = [] } = useQuery(
    collectionsQueryOptions(workspaceId)
  )
  const [selected, setSelected] = useState<Set<string>>(
    new Set(artifact?.collectionIds ?? [])
  )

  const mutation = useMutation({
    ...updateArtifactMutationOptions,
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["workspaces", workspaceId, "artifacts"],
      })
      onClose()
    },
  })

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose()
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Collections</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">
          An artifact can belong to multiple collections at the same time.
        </p>
        <div className="max-h-60 overflow-y-auto rounded-md border">
          {collections.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">
              No collections yet. Create one from the sidebar.
            </p>
          ) : (
            collections.map((col) => (
              <button
                key={col.id}
                className={`flex w-full items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-muted ${
                  selected.has(col.id) ? "bg-muted font-medium" : ""
                }`}
                onClick={() => toggle(col.id)}
              >
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: col.color }}
                />
                <span className="truncate">{col.name}</span>
                {selected.has(col.id) && (
                  <CheckIcon className="ml-auto size-3.5 shrink-0" />
                )}
              </button>
            ))
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={mutation.isPending}
            onClick={() => {
              if (!artifact) return
              mutation.mutate({
                workspaceId,
                id: artifact.id,
                collectionIds: [...selected],
              })
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
