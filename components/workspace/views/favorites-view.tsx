"use client"

import { StarIcon } from "lucide-react"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { deleteArtifactMutationOptions } from "@/lib/data/artifacts"
import {
  favoritesQueryOptions,
  toggleFavoriteMutationOptions,
} from "@/lib/data/favorites"

import { ArtifactListNavbar } from "@/components/workspace/views/artifact-list-navbar"
import { type ArtifactAction, ArtifactListView } from "@/components/workspace/views/artifact-list-view"

export function FavoritesView({ workspaceId }: { workspaceId: string }) {
  const qc = useQueryClient()
  const { data: favorites = [], isLoading } = useQuery(
    favoritesQueryOptions(workspaceId)
  )

  const invalidateFavorites = () =>
    qc.invalidateQueries({
      queryKey: favoritesQueryOptions(workspaceId).queryKey,
    })

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
      onClick: () =>
        unfavoriteMutation.mutate({ workspaceId, artifactId: art.id }),
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
    <div className="flex h-svh flex-col overflow-hidden">
      <ArtifactListNavbar
        workspaceId={workspaceId}
        label="Favorites"
        icon={<StarIcon className="size-3.5 text-muted-foreground" />}
      />
      <ArtifactListView
        workspaceId={workspaceId}
        artifacts={favorites}
        isLoading={isLoading}
        emptyTitle="No favorites yet"
        emptyDescription="Star artifacts from the All Items view to find them here."
        getActions={getActions}
      />
    </div>
  )
}
