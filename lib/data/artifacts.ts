import { mutationOptions, queryOptions } from "@tanstack/react-query"

export type SortBy = "updated" | "created" | "name"

export interface ArtifactSummary {
  id: string
  title: string
  workspaceId: string
  folderIds: string[]
  collectionIds: string[]
  isArchived: boolean
  isPublic: boolean
  role: "owner" | "editor" | "viewer"
  createdAt: string
  updatedAt: string
}

export interface Artifact extends ArtifactSummary {
  content: string | null
}

export const artifactsQueryOptions = (
  workspaceId: string,
  sort: SortBy = "updated"
) =>
  queryOptions({
    queryKey: ["workspaces", workspaceId, "artifacts", { sort }],
    queryFn: async (): Promise<ArtifactSummary[]> => {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/artifacts?sort=${sort}`
      )
      if (!res.ok) throw new Error("Failed to fetch artifacts")
      return res.json()
    },
    enabled: !!workspaceId,
  })

export const artifactQueryOptions = (workspaceId: string, artifactId: string) =>
  queryOptions({
    queryKey: ["workspaces", workspaceId, "artifacts", artifactId],
    queryFn: async (): Promise<Artifact> => {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/artifacts/${artifactId}`
      )
      if (!res.ok) throw new Error("Failed to fetch artifact")
      return res.json()
    },
    enabled: !!workspaceId && !!artifactId,
  })

export const createArtifactMutationOptions = mutationOptions({
  mutationFn: async ({
    workspaceId,
    title,
    content,
    folderIds,
    collectionIds,
  }: {
    workspaceId: string
    title: string
    content?: string | null
    folderIds?: string[]
    collectionIds?: string[]
  }): Promise<Artifact> => {
    const res = await fetch(`/api/workspaces/${workspaceId}/artifacts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, folderIds, collectionIds }),
    })
    if (!res.ok) throw new Error("Failed to create artifact")
    return res.json()
  },
})

export const updateArtifactMutationOptions = mutationOptions({
  mutationFn: async ({
    workspaceId,
    id,
    ...patch
  }: {
    workspaceId: string
    id: string
    title?: string
    content?: string | null
    isArchived?: boolean
    isPublic?: boolean
    folderIds?: string[]
    collectionIds?: string[]
  }): Promise<Artifact> => {
    const res = await fetch(`/api/workspaces/${workspaceId}/artifacts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    })
    if (!res.ok) throw new Error("Failed to update artifact")
    return res.json()
  },
})

export const deleteArtifactMutationOptions = mutationOptions({
  mutationFn: async ({
    workspaceId,
    id,
  }: {
    workspaceId: string
    id: string
  }): Promise<void> => {
    const res = await fetch(`/api/workspaces/${workspaceId}/artifacts/${id}`, {
      method: "DELETE",
    })
    if (!res.ok) throw new Error("Failed to delete artifact")
  },
})
