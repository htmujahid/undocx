"use client"

import { useState } from "react"

import { CheckIcon, FolderIcon, PlusIcon } from "lucide-react"
import { useRouter } from "next/navigation"

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
  artifactsQueryOptions,
  deleteArtifactMutationOptions,
  updateArtifactMutationOptions,
} from "@/lib/data/artifacts"
import {
  type Collection,
  collectionsQueryOptions,
} from "@/lib/data/collections"
import {
  favoritesQueryOptions,
  toggleFavoriteMutationOptions,
} from "@/lib/data/favorites"
import { type Folder, foldersQueryOptions } from "@/lib/data/folders"

import { type ArtifactAction, ArtifactListView } from "./artifact-list-view"

export function WorkspaceHome({ workspaceId }: { workspaceId: string }) {
  const router = useRouter()
  const qc = useQueryClient()
  const { data: artifacts = [], isLoading } = useQuery(
    artifactsQueryOptions(workspaceId)
  )
  const { data: folders = [] } = useQuery(foldersQueryOptions(workspaceId))
  const { data: collections = [] } = useQuery(
    collectionsQueryOptions(workspaceId)
  )
  const { data: favorites = [] } = useQuery(favoritesQueryOptions(workspaceId))

  const [moveTarget, setMoveTarget] = useState<ArtifactSummary | null>(null)
  const [collectionTarget, setCollectionTarget] =
    useState<ArtifactSummary | null>(null)

  const favoriteIds = new Set(favorites.map((f) => f.id))

  const invalidateArtifacts = () =>
    qc.invalidateQueries({
      queryKey: artifactsQueryOptions(workspaceId).queryKey,
    })

  const invalidateFavorites = () =>
    qc.invalidateQueries({
      queryKey: favoritesQueryOptions(workspaceId).queryKey,
    })

  const updateMutation = useMutation({
    ...updateArtifactMutationOptions,
    onSuccess: invalidateArtifacts,
  })
  const deleteMutation = useMutation({
    ...deleteArtifactMutationOptions,
    onSuccess: invalidateArtifacts,
  })
  const favoriteMutation = useMutation({
    ...toggleFavoriteMutationOptions,
    onSuccess: invalidateFavorites,
  })

  const displayedArtifacts = artifacts.filter((a) => !a.isArchived)

  const getActions = (art: ArtifactSummary): ArtifactAction[] => [
    {
      type: "action",
      label: "Move to folder",
      onClick: () => setMoveTarget(art),
    },
    {
      type: "action",
      label: "Add to collection",
      onClick: () => setCollectionTarget(art),
    },
    {
      type: "action",
      label: favoriteIds.has(art.id) ? "Unfavorite" : "Favorite",
      onClick: () =>
        favoriteMutation.mutate({ workspaceId, artifactId: art.id }),
    },
    {
      type: "action",
      label: "Archive",
      onClick: () =>
        updateMutation.mutate({ workspaceId, id: art.id, isArchived: true }),
    },
    { type: "separator" },
    {
      type: "action",
      label: "Delete",
      destructive: true,
      onClick: () => deleteMutation.mutate({ workspaceId, id: art.id }),
    },
  ]

  const handleMoveToFolders = (folderIds: string[]) => {
    if (!moveTarget) return
    updateMutation.mutate(
      { workspaceId, id: moveTarget.id, folderIds },
      { onSuccess: () => setMoveTarget(null) }
    )
  }

  const handleSaveCollections = (collectionIds: string[]) => {
    if (!collectionTarget) return
    updateMutation.mutate(
      { workspaceId, id: collectionTarget.id, collectionIds },
      { onSuccess: () => setCollectionTarget(null) }
    )
  }

  return (
    <>
      <ArtifactListView
        workspaceId={workspaceId}
        artifacts={displayedArtifacts}
        isLoading={isLoading}
        headerLabel="All artifacts"
        emptyTitle="No artifacts yet"
        emptyDescription="Create your first artifact to get started"
        emptyAction={
          <Button
            size="sm"
            className="mt-1 gap-1.5"
            onClick={() => router.push(`/workspace/${workspaceId}/new`)}
          >
            <PlusIcon className="size-3.5" />
            New artifact
          </Button>
        }
        getActions={getActions}
      />

      <MoveToFolderDialog
        key={moveTarget?.id ?? "closed"}
        open={!!moveTarget}
        folders={folders}
        currentFolderIds={moveTarget?.folderIds ?? []}
        isPending={updateMutation.isPending}
        onMove={handleMoveToFolders}
        onClose={() => setMoveTarget(null)}
      />

      <AddToCollectionDialog
        key={collectionTarget?.id ?? "col-closed"}
        open={!!collectionTarget}
        collections={collections}
        currentCollectionIds={collectionTarget?.collectionIds ?? []}
        isPending={updateMutation.isPending}
        onSave={handleSaveCollections}
        onClose={() => setCollectionTarget(null)}
      />
    </>
  )
}

// ── Move to folder dialog ─────────────────────────────────────────────────────

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

function MoveToFolderDialog({
  open,
  folders,
  currentFolderIds,
  isPending,
  onMove,
  onClose,
}: {
  open: boolean
  folders: Folder[]
  currentFolderIds: string[]
  isPending: boolean
  onMove: (folderIds: string[]) => void
  onClose: () => void
}) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(currentFolderIds)
  )
  const tree = buildFolderTree(folders, null, 0)

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
            disabled={isPending}
            onClick={() => onMove([...selected])}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Add to collection dialog ──────────────────────────────────────────────────

function AddToCollectionDialog({
  open,
  collections,
  currentCollectionIds,
  isPending,
  onSave,
  onClose,
}: {
  open: boolean
  collections: Collection[]
  currentCollectionIds: string[]
  isPending: boolean
  onSave: (collectionIds: string[]) => void
  onClose: () => void
}) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(currentCollectionIds)
  )

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
            disabled={isPending}
            onClick={() => onSave([...selected])}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
