import { mutationOptions, queryOptions } from "@tanstack/react-query"

const MAX_RECENT = 10

function storageKey(workspaceId: string) {
  return `recent_artifacts_${workspaceId}`
}

export const recentArtifactIdsQueryOptions = (workspaceId: string) =>
  queryOptions({
    queryKey: ["workspaces", workspaceId, "recent-ids"],
    queryFn: (): string[] => {
      try {
        const stored = localStorage.getItem(storageKey(workspaceId))
        return stored ? (JSON.parse(stored) as string[]) : []
      } catch {
        return []
      }
    },
    staleTime: 0,
  })

export const addRecentArtifactMutationOptions = mutationOptions({
  mutationFn: async ({
    workspaceId,
    artifactId,
  }: {
    workspaceId: string
    artifactId: string
  }): Promise<void> => {
    try {
      const key = storageKey(workspaceId)
      const stored = localStorage.getItem(key)
      const ids: string[] = stored ? JSON.parse(stored) : []
      const filtered = ids.filter((id) => id !== artifactId)
      localStorage.setItem(key, JSON.stringify([artifactId, ...filtered].slice(0, MAX_RECENT)))
    } catch {}
  },
})
