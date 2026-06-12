"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  type ArtifactSummary,
  artifactsQueryOptions,
  deleteArtifactMutationOptions,
  updateArtifactMutationOptions,
} from "@/lib/data/artifacts"
import { collectionsQueryOptions } from "@/lib/data/collections"
import { favoritesQueryOptions, toggleFavoriteMutationOptions } from "@/lib/data/favorites"
import { foldersQueryOptions } from "@/lib/data/folders"
import { ArtifactListView, type ArtifactAction } from "./artifact-list-view"

interface CollectionViewProps {
  workspaceId: string
  collectionId: string
}

export function CollectionView({ workspaceId, collectionId }: CollectionViewProps) {
  const qc = useQueryClient()
  const { data: artifacts = [], isLoading } = useQuery(artifactsQueryOptions(workspaceId))
  const { data: folders = [] } = useQuery(foldersQueryOptions(workspaceId))
  const { data: collections = [] } = useQuery(collectionsQueryOptions(workspaceId))
  const { data: favorites = [] } = useQuery(favoritesQueryOptions(workspaceId))

  const favoriteIds = new Set(favorites.map((f) => f.id))
  const collection = collections.find((c) => c.id === collectionId)

  const invalidateArtifacts = () =>
    qc.invalidateQueries({ queryKey: artifactsQueryOptions(workspaceId).queryKey })

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
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: favoritesQueryOptions(workspaceId).queryKey }),
  })

  const displayedArtifacts = artifacts.filter(
    (a) => !a.isArchived && a.collectionIds.includes(collectionId)
  )

  const getActions = (art: ArtifactSummary): ArtifactAction[] => [
    {
      type: "action",
      label: favoriteIds.has(art.id) ? "Unfavorite" : "Favorite",
      onClick: () => favoriteMutation.mutate({ workspaceId, artifactId: art.id }),
    },
    {
      type: "action",
      label: "Archive",
      onClick: () => updateMutation.mutate({ workspaceId, id: art.id, isArchived: true }),
    },
    {
      type: "action",
      label: "Remove from collection",
      onClick: () =>
        updateMutation.mutate({
          workspaceId,
          id: art.id,
          collectionIds: art.collectionIds.filter((id) => id !== collectionId),
        }),
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
    <ArtifactListView
      workspaceId={workspaceId}
      artifacts={displayedArtifacts}
      folders={folders}
      collections={collections}
      isLoading={isLoading}
      headerLabel={collection?.name ?? "Collection"}
      headerIcon={
        collection ? (
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: collection.color }}
          />
        ) : undefined
      }
      emptyTitle="No artifacts in this collection"
      emptyDescription="Add artifacts to this collection from the All Items view."
      getActions={getActions}
    />
  )
}
