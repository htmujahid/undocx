import { mutationOptions, queryOptions } from "@tanstack/react-query"

import type { ArtifactSummary } from "./artifacts"

export const favoritesQueryOptions = (workspaceId: string) =>
  queryOptions({
    queryKey: ["workspaces", workspaceId, "favorites"],
    queryFn: async (): Promise<ArtifactSummary[]> => {
      const res = await fetch(`/api/workspaces/${workspaceId}/favorites`)
      if (!res.ok) throw new Error("Failed to fetch favorites")
      return res.json()
    },
    enabled: !!workspaceId,
  })

export const toggleFavoriteMutationOptions = mutationOptions({
  mutationFn: async ({
    workspaceId,
    artifactId,
  }: {
    workspaceId: string
    artifactId: string
  }): Promise<{ isFavorited: boolean }> => {
    const res = await fetch(
      `/api/workspaces/${workspaceId}/favorites/${artifactId}`,
      {
        method: "POST",
      }
    )
    if (!res.ok) throw new Error("Failed to toggle favorite")
    return res.json()
  },
})
