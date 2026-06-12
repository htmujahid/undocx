import { mutationOptions, queryOptions } from "@tanstack/react-query"

export interface Collection {
  id: string
  name: string
  color: string
  workspaceId: string
  createdAt: string
  updatedAt: string
}

export const collectionsQueryOptions = (workspaceId: string) =>
  queryOptions({
    queryKey: ["workspaces", workspaceId, "collections"],
    queryFn: async (): Promise<Collection[]> => {
      const res = await fetch(`/api/workspaces/${workspaceId}/collections`)
      if (!res.ok) throw new Error("Failed to fetch collections")
      return res.json()
    },
    enabled: !!workspaceId,
  })

export const createCollectionMutationOptions = mutationOptions({
  mutationFn: async ({
    workspaceId,
    name,
    color,
  }: {
    workspaceId: string
    name: string
    color?: string
  }): Promise<Collection> => {
    const res = await fetch(`/api/workspaces/${workspaceId}/collections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color }),
    })
    if (!res.ok) throw new Error("Failed to create collection")
    return res.json()
  },
})

export const updateCollectionMutationOptions = mutationOptions({
  mutationFn: async ({
    workspaceId,
    id,
    name,
    color,
  }: {
    workspaceId: string
    id: string
    name: string
    color?: string
  }): Promise<Collection> => {
    const res = await fetch(
      `/api/workspaces/${workspaceId}/collections/${id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color }),
      }
    )
    if (!res.ok) throw new Error("Failed to update collection")
    return res.json()
  },
})

export const deleteCollectionMutationOptions = mutationOptions({
  mutationFn: async ({
    workspaceId,
    id,
  }: {
    workspaceId: string
    id: string
  }): Promise<void> => {
    const res = await fetch(
      `/api/workspaces/${workspaceId}/collections/${id}`,
      {
        method: "DELETE",
      }
    )
    if (!res.ok) throw new Error("Failed to delete collection")
  },
})
