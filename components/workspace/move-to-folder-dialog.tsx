"use client"

import { useState } from "react"

import { CheckIcon, FolderIcon } from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { type ArtifactSummary, updateArtifactMutationOptions } from "@/lib/data/artifacts"
import { type Folder, foldersQueryOptions } from "@/lib/data/folders"

function buildFolderTree(
  folders: Folder[],
  parentId: string | null,
  depth: number
): Array<{ folder: Folder; depth: number }> {
  return folders
    .filter((f) => f.parentId === parentId)
    .flatMap((f) => [
      { folder: f, depth },
      ...buildFolderTree(folders, f.id, depth + 1),
    ])
}

export function MoveToFolderDialog({
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
  const { data: folders = [] } = useQuery(foldersQueryOptions(workspaceId))
  const [selected, setSelected] = useState<Set<string>>(
    new Set(artifact?.folderIds ?? [])
  )
  const tree = buildFolderTree(folders, null, 0)

  const mutation = useMutation({
    ...updateArtifactMutationOptions,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workspaces", workspaceId, "artifacts"] })
      onClose()
    },
  })

  const toggle = (folderId: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(folderId)) next.delete(folderId)
      else next.add(folderId)
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
          <DialogTitle>Folders</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">
          An artifact can live in multiple folders at the same time.
        </p>
        <div className="max-h-60 overflow-y-auto rounded-md border">
          <button
            className={`flex w-full items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-muted ${
              selected.size === 0 ? "bg-muted font-medium" : ""
            }`}
            onClick={() => setSelected(new Set())}
          >
            <FolderIcon className="size-3.5 text-muted-foreground" />
            <span>No folder (root)</span>
          </button>
          {tree.map(({ folder, depth }) => (
            <button
              key={folder.id}
              className={`flex w-full items-center gap-2 py-2 pr-3 text-xs transition-colors hover:bg-muted ${
                selected.has(folder.id) ? "bg-muted font-medium" : ""
              }`}
              style={{ paddingLeft: `${depth * 12 + 12}px` }}
              onClick={() => toggle(folder.id)}
            >
              <FolderIcon className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate">{folder.name}</span>
              {selected.has(folder.id) && (
                <CheckIcon className="ml-auto size-3.5 shrink-0" />
              )}
            </button>
          ))}
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
              mutation.mutate({ workspaceId, id: artifact.id, folderIds: [...selected] })
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
