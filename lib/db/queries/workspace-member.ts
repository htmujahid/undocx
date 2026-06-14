import { and, eq } from "drizzle-orm"

import { db } from "@/lib/db"
import {
  type MemberRole,
  user,
  workspace,
  workspaceMember,
} from "@/lib/db/schema"

export async function getWorkspaceMember(workspaceId: string, userId: string) {
  const [member] = await db
    .select({ userId: workspaceMember.userId })
    .from(workspaceMember)
    .where(
      and(
        eq(workspaceMember.workspaceId, workspaceId),
        eq(workspaceMember.userId, userId)
      )
    )
  return member ?? null
}

export function listWorkspaceMembers(workspaceId: string) {
  return db
    .select({
      userId: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: workspaceMember.role,
    })
    .from(workspaceMember)
    .innerJoin(user, eq(user.id, workspaceMember.userId))
    .where(eq(workspaceMember.workspaceId, workspaceId))
    .orderBy(workspaceMember.createdAt)
}

export async function getWorkspaceOwnerProfile(workspaceId: string) {
  const [owner] = await db
    .select({
      userId: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    })
    .from(workspace)
    .innerJoin(user, eq(user.id, workspace.ownerId))
    .where(eq(workspace.id, workspaceId))
  return owner ?? null
}

export async function updateWorkspaceMemberRole(
  workspaceId: string,
  userId: string,
  role: MemberRole
) {
  const [updated] = await db
    .update(workspaceMember)
    .set({ role })
    .where(
      and(
        eq(workspaceMember.workspaceId, workspaceId),
        eq(workspaceMember.userId, userId)
      )
    )
    .returning()
  return updated ?? null
}

export async function removeWorkspaceMember(
  workspaceId: string,
  userId: string
) {
  const [deleted] = await db
    .delete(workspaceMember)
    .where(
      and(
        eq(workspaceMember.workspaceId, workspaceId),
        eq(workspaceMember.userId, userId)
      )
    )
    .returning()
  return deleted ?? null
}

export async function upsertWorkspaceMember(
  workspaceId: string,
  userId: string,
  role: MemberRole
) {
  await db
    .insert(workspaceMember)
    .values({ workspaceId, userId, role })
    .onConflictDoUpdate({
      target: [workspaceMember.workspaceId, workspaceMember.userId],
      set: { role },
    })
}
