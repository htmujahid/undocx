import { and, count, desc, eq, isNull, ne } from "drizzle-orm"

import { db } from "@/lib/db"
import {
  type NotificationData,
  type NotificationType,
  notification,
  user,
  workspace,
  workspaceMember,
} from "@/lib/db/schema"

interface NewNotification {
  userId: string
  type: NotificationType
  actorId: string
  workspaceId?: string | null
  artifactId?: string | null
  data: NotificationData
}

// Persist one notification. Trigger sites call this from `after()` so a failed
// insert never affects the originating request.
export async function createNotification(input: NewNotification) {
  await db.insert(notification).values({
    userId: input.userId,
    type: input.type,
    actorId: input.actorId,
    workspaceId: input.workspaceId ?? null,
    artifactId: input.artifactId ?? null,
    data: input.data,
  })
}

// Fan-out: one row per recipient. No-op when there are no recipients.
export async function createNotifications(inputs: NewNotification[]) {
  if (!inputs.length) return
  await db.insert(notification).values(
    inputs.map((input) => ({
      userId: input.userId,
      type: input.type,
      actorId: input.actorId,
      workspaceId: input.workspaceId ?? null,
      artifactId: input.artifactId ?? null,
      data: input.data,
    }))
  )
}

// Everyone with workspace-wide access (owner + members) except the actor —
// the audience for workspace-level activity like a new document.
export async function listWorkspaceNotifyRecipients(
  workspaceId: string,
  exceptUserId: string
): Promise<string[]> {
  const [members, [workspaceRow]] = await Promise.all([
    db
      .select({ userId: workspaceMember.userId })
      .from(workspaceMember)
      .where(
        and(
          eq(workspaceMember.workspaceId, workspaceId),
          ne(workspaceMember.userId, exceptUserId)
        )
      ),
    db
      .select({ ownerId: workspace.ownerId })
      .from(workspace)
      .where(eq(workspace.id, workspaceId)),
  ])

  const ids = new Set(members.map((m) => m.userId))
  if (workspaceRow && workspaceRow.ownerId !== exceptUserId)
    ids.add(workspaceRow.ownerId)
  return [...ids]
}

export interface NotificationRow {
  id: string
  type: NotificationType
  workspaceId: string | null
  artifactId: string | null
  data: NotificationData
  readAt: Date | null
  createdAt: Date
  actorImage: string | null
}

// A user's most recent notifications, newest first.
export function listNotifications(
  userId: string,
  limit = 30
): Promise<NotificationRow[]> {
  return db
    .select({
      id: notification.id,
      type: notification.type,
      workspaceId: notification.workspaceId,
      artifactId: notification.artifactId,
      data: notification.data,
      readAt: notification.readAt,
      createdAt: notification.createdAt,
      actorImage: user.image,
    })
    .from(notification)
    .leftJoin(user, eq(user.id, notification.actorId))
    .where(eq(notification.userId, userId))
    .orderBy(desc(notification.createdAt))
    .limit(limit)
}

export async function countUnreadNotifications(userId: string) {
  const [row] = await db
    .select({ value: count() })
    .from(notification)
    .where(
      and(eq(notification.userId, userId), isNull(notification.readAt))
    )
  return row?.value ?? 0
}

// Mark the user's unread notifications read. Scoped to userId so a caller can
// never touch another user's feed.
export async function markNotificationsRead(userId: string) {
  await db
    .update(notification)
    .set({ readAt: new Date() })
    .where(
      and(eq(notification.userId, userId), isNull(notification.readAt))
    )
}
