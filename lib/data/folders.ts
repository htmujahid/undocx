import { mutationOptions, queryOptions } from "@tanstack/react-query"

export interface Folder {
  id: string
  name: string
  workspaceId: string
  parentId: string | null
  createdAt: string
  updatedAt: string
}

export const foldersQueryOptions = (workspaceId: string) =>
  queryOptions({
    queryKey: ["workspaces", workspaceId, "folders"],
    queryFn: async (): Promise<Folder[]> => {
      const res = await fetch(`/api/workspaces/${workspaceId}/folders`)
      if (!res.ok) throw new Error("Failed to fetch folders")
      return res.json()
    },
    enabled: !!workspaceId,
  })

export const createFolderMutationOptions = mutationOptions({
  mutationFn: async ({
    workspaceId,
    name,
    parentId,
  }: {
    workspaceId: string
    name: string
    parentId?: string | null
  }): Promise<Folder> => {
    const res = await fetch(`/api/workspaces/${workspaceId}/folders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, parentId }),
    })
    if (!res.ok) throw new Error("Failed to create folder")
    return res.json()
  },
})

export const updateFolderMutationOptions = mutationOptions({
  mutationFn: async ({
    workspaceId,
    id,
    name,
  }: {
    workspaceId: string
    id: string
    name: string
  }): Promise<Folder> => {
    const res = await fetch(`/api/workspaces/${workspaceId}/folders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
    if (!res.ok) throw new Error("Failed to update folder")
    return res.json()
  },
})

export const moveFolderMutationOptions = mutationOptions({
  mutationFn: async ({
    workspaceId,
    id,
    parentId,
  }: {
    workspaceId: string
    id: string
    parentId: string | null
  }): Promise<Folder> => {
    const res = await fetch(`/api/workspaces/${workspaceId}/folders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parentId }),
    })
    if (!res.ok) throw new Error("Failed to move folder")
    return res.json()
  },
})

export const deleteFolderMutationOptions = mutationOptions({
  mutationFn: async ({
    workspaceId,
    id,
  }: {
    workspaceId: string
    id: string
  }): Promise<void> => {
    const res = await fetch(`/api/workspaces/${workspaceId}/folders/${id}`, {
      method: "DELETE",
    })
    if (!res.ok) throw new Error("Failed to delete folder")
  },
})
