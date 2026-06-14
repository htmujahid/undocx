import { mutationOptions, queryOptions } from "@tanstack/react-query"

export type NotificationType =
  | "invitation_accepted"
  | "workspace_role_changed"
  | "workspace_removed"
  | "artifact_role_changed"
  | "artifact_removed"
  | "artifact_created"

export interface AppNotification {
  id: string
  type: NotificationType
  workspaceId: string | null
  artifactId: string | null
  data: {
    actorName: string
    resourceName: string
    role?: string
  }
  readAt: string | null
  createdAt: string
  actorImage: string | null
}

export interface NotificationsResponse {
  notifications: AppNotification[]
  unreadCount: number
}

// Polled — the app has no realtime channel, so the bell refreshes on an
// interval (and on window focus, React Query's default).
export const notificationsQueryOptions = queryOptions({
  queryKey: ["notifications"],
  queryFn: async (): Promise<NotificationsResponse> => {
    const res = await fetch("/api/notifications")
    const body = await res.json().catch(() => null)
    if (!res.ok) throw new Error(body?.error ?? "Failed to fetch notifications")
    return body as NotificationsResponse
  },
  refetchInterval: 60_000,
})

export const markNotificationsReadMutationOptions = mutationOptions({
  mutationFn: async (): Promise<void> => {
    const res = await fetch("/api/notifications/read", { method: "POST" })
    if (!res.ok) throw new Error("Failed to mark notifications read")
  },
})
