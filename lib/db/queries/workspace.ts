import { and, count, eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { workspace, workspaceMember } from "@/lib/db/schema"

// Workspaces owned by the user.
export function listOwnedWorkspaces(userId: string) {
  return db.select().from(workspace).where(eq(workspace.ownerId, userId))
}

// Workspaces the user is a (non-owner) member of, with their role.
export function listWorkspaceMemberships(userId: string) {
  return db
    .select({ workspace: workspace, role: workspaceMember.role })
    .from(workspaceMember)
    .innerJoin(workspace, eq(workspace.id, workspaceMember.workspaceId))
    .where(eq(workspaceMember.userId, userId))
}

export async function createWorkspace(name: string, ownerId: string) {
  const [created] = await db
    .insert(workspace)
    .values({ name, ownerId })
    .returning()
  return created
}

export async function updateWorkspaceName(
  id: string,
  ownerId: string,
  name: string
) {
  const [updated] = await db
    .update(workspace)
    .set({ name })
    .where(and(eq(workspace.id, id), eq(workspace.ownerId, ownerId)))
    .returning()
  return updated ?? null
}

export async function countOwnedWorkspaces(ownerId: string) {
  const [{ total }] = await db
    .select({ total: count() })
    .from(workspace)
    .where(eq(workspace.ownerId, ownerId))
  return total
}

export async function deleteOwnedWorkspace(id: string, ownerId: string) {
  const [deleted] = await db
    .delete(workspace)
    .where(and(eq(workspace.id, id), eq(workspace.ownerId, ownerId)))
    .returning()
  return deleted ?? null
}

export async function getWorkspaceById(id: string) {
  const [ws] = await db.select().from(workspace).where(eq(workspace.id, id))
  return ws ?? null
}

export async function getOwnedWorkspace(id: string, ownerId: string) {
  const [ws] = await db
    .select()
    .from(workspace)
    .where(and(eq(workspace.id, id), eq(workspace.ownerId, ownerId)))
  return ws ?? null
}

export async function getFirstOwnedWorkspace(ownerId: string) {
  const [first] = await db
    .select({ id: workspace.id })
    .from(workspace)
    .where(eq(workspace.ownerId, ownerId))
    .orderBy(workspace.createdAt)
    .limit(1)
  return first ?? null
}

export async function getWorkspaceName(id: string) {
  const [ws] = await db
    .select({ name: workspace.name })
    .from(workspace)
    .where(eq(workspace.id, id))
  return ws ?? null
}
