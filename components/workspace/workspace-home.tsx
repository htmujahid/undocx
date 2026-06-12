"use client"

import { useState } from "react"

import { PlusIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import {
  type ArtifactSummary,
  type SortBy,
  artifactsQueryOptions,
  deleteArtifactMutationOptions,
  updateArtifactMutationOptions,
} from "@/lib/data/artifacts"
import {
  favoritesQueryOptions,
  toggleFavoriteMutationOptions,
} from "@/lib/data/favorites"

import { AddToCollectionDialog } from "./add-to-collection-dialog"
import { ArtifactListNavbar } from "./artifact-list-navbar"
import { type ArtifactAction, ArtifactListView } from "./artifact-list-view"
import { MoveToFolderDialog } from "./move-to-folder-dialog"

export function WorkspaceHome({ workspaceId }: { workspaceId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sort = (searchParams.get("sort") as SortBy | null) ?? "updated"
  const qc = useQueryClient()
  const { data: artifacts = [], isLoading } = useQuery(
    artifactsQueryOptions(workspaceId, sort)
  )
  const { data: favorites = [] } = useQuery(favoritesQueryOptions(workspaceId))

  const [moveTarget, setMoveTarget] = useState<ArtifactSummary | null>(null)
  const [collectionTarget, setCollectionTarget] =
    useState<ArtifactSummary | null>(null)

  const favoriteIds = new Set(favorites.map((f) => f.id))

  const invalidateArtifacts = () =>
    qc.invalidateQueries({
      queryKey: ["workspaces", workspaceId, "artifacts"],
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

  return (
    <>
      <div className="flex h-svh flex-col overflow-hidden">
        <ArtifactListNavbar workspaceId={workspaceId} label="All artifacts" />
        <ArtifactListView
          workspaceId={workspaceId}
          artifacts={artifacts}
          isLoading={isLoading}
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
      </div>

      <MoveToFolderDialog
        key={moveTarget?.id ?? "closed"}
        open={!!moveTarget}
        workspaceId={workspaceId}
        artifact={moveTarget}
        onClose={() => setMoveTarget(null)}
      />

      <AddToCollectionDialog
        key={collectionTarget?.id ?? "col-closed"}
        open={!!collectionTarget}
        workspaceId={workspaceId}
        artifact={collectionTarget}
        onClose={() => setCollectionTarget(null)}
      />
    </>
  )
}
