"use client"

import { useState } from "react"

import {
  ArchiveIcon,
  CheckIcon,
  FileTextIcon,
  FolderIcon,
  LayersIcon,
  PlusIcon,
  StarIcon,
} from "lucide-react"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
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

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

interface WorkspaceHomeProps {
  workspaceId: string
}

export function WorkspaceHome({ workspaceId }: WorkspaceHomeProps) {
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
      <div className="flex h-svh flex-col overflow-hidden">
        <header className="flex h-11 shrink-0 items-center justify-between border-b px-3">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <span className="text-xs text-muted-foreground">All artifacts</span>
          </div>
          <Button
            size="sm"
            className="h-7 gap-1.5 text-xs"
            onClick={() => router.push(`/workspace/${workspaceId}/new`)}
          >
            <PlusIcon className="size-3.5" />
            New artifact
          </Button>
        </header>

        <div className="min-h-0 flex-1 overflow-auto p-6">
          {isLoading ? (
            <ArtifactGrid>
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </ArtifactGrid>
          ) : displayedArtifacts.length === 0 ? (
            <EmptyState workspaceId={workspaceId} />
          ) : (
            <ArtifactGrid>
              {displayedArtifacts.map((art) => (
                <ArtifactCard
                  key={art.id}
                  artifact={art}
                  folders={folders}
                  collections={collections}
                  isFavorited={favoriteIds.has(art.id)}
                  onClick={() =>
                    router.push(`/workspace/${workspaceId}/${art.id}`)
                  }
                  onMove={() => setMoveTarget(art)}
                  onAddToCollection={() => setCollectionTarget(art)}
                  onFavoriteToggle={() =>
                    favoriteMutation.mutate({ workspaceId, artifactId: art.id })
                  }
                  onArchive={() =>
                    updateMutation.mutate({
                      workspaceId,
                      id: art.id,
                      isArchived: true,
                    })
                  }
                  onDelete={() =>
                    deleteMutation.mutate({ workspaceId, id: art.id })
                  }
                />
              ))}
            </ArtifactGrid>
          )}
        </div>
      </div>

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

// ── Sub-components ────────────────────────────────────────────────────────────

function ArtifactGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
      {children}
    </div>
  )
}

function ArtifactCard({
  artifact,
  folders,
  collections,
  isFavorited,
  onClick,
  onMove,
  onAddToCollection,
  onFavoriteToggle,
  onArchive,
  onDelete,
}: {
  artifact: ArtifactSummary
  folders: Folder[]
  collections: Collection[]
  isFavorited?: boolean
  onClick: () => void
  onMove: () => void
  onAddToCollection: () => void
  onFavoriteToggle?: () => void
  onArchive?: () => void
  onDelete: () => void
}) {
  const artifactFolders = artifact.folderIds
    .map((id) => folders.find((f) => f.id === id))
    .filter((f): f is Folder => !!f)

  const artifactCollections = artifact.collectionIds
    .map((id) => collections.find((c) => c.id === id))
    .filter((c): c is Collection => !!c)

  return (
    <div className="group flex flex-col rounded-lg border bg-card transition-colors hover:bg-accent hover:text-accent-foreground">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <FileTextIcon className="size-5 shrink-0 text-muted-foreground" />
        <DropdownMenu>
          <DropdownMenuTrigger className="invisible flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground group-hover:visible data-[state=open]:visible">
            <span className="text-xs leading-none">···</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={onMove}>
              <FolderIcon className="mr-2 size-3.5" />
              Move to folder
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onAddToCollection}>
              <LayersIcon className="mr-2 size-3.5" />
              Add to collection
            </DropdownMenuItem>
            {onFavoriteToggle && (
              <DropdownMenuItem onClick={onFavoriteToggle}>
                <StarIcon className="mr-2 size-3.5" />
                {isFavorited ? "Unfavorite" : "Favorite"}
              </DropdownMenuItem>
            )}
            {onArchive && (
              <DropdownMenuItem onClick={onArchive}>
                <ArchiveIcon className="mr-2 size-3.5" />
                Archive
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={onDelete}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <button onClick={onClick} className="min-w-0 px-4 pb-4 text-left">
        <p className="truncate text-sm font-medium leading-snug">
          {artifact.title || "Untitled"}
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {relativeTime(artifact.updatedAt)}
        </p>
        {artifactFolders.length > 0 && (
          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
            <FolderIcon className="size-2.5 shrink-0" />
            <span className="truncate">
              {artifactFolders.map((f) => f.name).join(", ")}
            </span>
          </p>
        )}
        {artifactCollections.length > 0 && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            {artifactCollections.map((col) => (
              <span
                key={col.id}
                className="flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
              >
                <span
                  className="size-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: col.color }}
                />
                <span className="max-w-20 truncate">{col.name}</span>
              </span>
            ))}
          </div>
        )}
      </button>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
      <div className="size-5 animate-pulse rounded bg-muted" />
      <div className="space-y-1.5">
        <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-2.5 w-1/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}

function EmptyState({ workspaceId }: { workspaceId: string }) {
  const router = useRouter()
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <FileTextIcon className="size-5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium">No artifacts yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Create your first artifact to get started
        </p>
      </div>
      <Button
        size="sm"
        className="mt-1 gap-1.5"
        onClick={() => router.push(`/workspace/${workspaceId}/new`)}
      >
        <PlusIcon className="size-3.5" />
        New artifact
      </Button>
    </div>
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
