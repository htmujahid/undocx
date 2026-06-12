"use client"

import { StarIcon } from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { collectionsQueryOptions } from "@/lib/data/collections"
import { foldersQueryOptions } from "@/lib/data/folders"
import { favoritesQueryOptions, toggleFavoriteMutationOptions } from "@/lib/data/favorites"
import { deleteArtifactMutationOptions } from "@/lib/data/artifacts"
import { ArtifactListView, type ArtifactAction } from "./artifact-list-view"

interface FavoritesViewProps {
  workspaceId: string
}

export function FavoritesView({ workspaceId }: FavoritesViewProps) {
  const qc = useQueryClient()
  const { data: favorites = [], isLoading } = useQuery(favoritesQueryOptions(workspaceId))
  const { data: folders = [] } = useQuery(foldersQueryOptions(workspaceId))
  const { data: collections = [] } = useQuery(collectionsQueryOptions(workspaceId))

  const invalidateFavorites = () =>
    qc.invalidateQueries({ queryKey: favoritesQueryOptions(workspaceId).queryKey })

  const unfavoriteMutation = useMutation({
    ...toggleFavoriteMutationOptions,
    onSuccess: invalidateFavorites,
  })
  const deleteMutation = useMutation({
    ...deleteArtifactMutationOptions,
    onSuccess: invalidateFavorites,
  })

  const getActions = (art: { id: string }): ArtifactAction[] => [
    {
      type: "action",
      label: "Unfavorite",
      onClick: () => unfavoriteMutation.mutate({ workspaceId, artifactId: art.id }),
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
      artifacts={favorites}
      folders={folders}
      collections={collections}
      isLoading={isLoading}
      headerLabel="Favorites"
      headerIcon={<StarIcon className="size-3.5 text-muted-foreground" />}
      emptyTitle="No favorites yet"
      emptyDescription="Star artifacts from the All Items view to find them here."
      getActions={getActions}
    />
  )
}
