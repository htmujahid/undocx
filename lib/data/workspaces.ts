import { mutationOptions, queryOptions } from "@tanstack/react-query"

export interface Workspace {
  id: string
  name: string
  ownerId: string
  // The current user's role in this workspace.
  role: "owner" | "editor" | "viewer"
  createdAt: string
  updatedAt: string
}

export const workspacesQueryOptions = queryOptions({
  queryKey: ["workspaces"],
  queryFn: async (): Promise<Workspace[]> => {
    const res = await fetch("/api/workspaces")
    if (!res.ok) throw new Error("Failed to fetch workspaces")
    return res.json()
  },
})

export const createWorkspaceMutationOptions = mutationOptions({
  mutationFn: async (name: string): Promise<Workspace> => {
    const res = await fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
    if (!res.ok) throw new Error("Failed to create workspace")
    return res.json()
  },
})

export const updateWorkspaceMutationOptions = mutationOptions({
  mutationFn: async ({
    id,
    name,
  }: {
    id: string
    name: string
  }): Promise<Workspace> => {
    const res = await fetch(`/api/workspaces/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
    if (!res.ok) throw new Error("Failed to update workspace")
    return res.json()
  },
})

export const deleteWorkspaceMutationOptions = mutationOptions({
  mutationFn: async (id: string): Promise<void> => {
    const res = await fetch(`/api/workspaces/${id}`, { method: "DELETE" })
    if (!res.ok) throw new Error("Failed to delete workspace")
  },
})
