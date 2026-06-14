import { and, eq } from "drizzle-orm"

import { db } from "@/lib/db"
import {
  type MemberRole,
  artifact,
  artifactMember,
  workspace,
  workspaceMember,
} from "@/lib/db/schema"

export type WorkspaceRole = "owner" | MemberRole

export function canEdit(role: WorkspaceRole | null | undefined) {
  return role === "owner" || role === "editor"
}

export async function getWorkspaceRole(
  workspaceId: string,
  userId: string
): Promise<WorkspaceRole | null> {
  const [workspaceRow] = await db
    .select({ ownerId: workspace.ownerId })
    .from(workspace)
    .where(eq(workspace.id, workspaceId))
  if (!workspaceRow) return null
  if (workspaceRow.ownerId === userId) return "owner"

  const [member] = await db
    .select({ role: workspaceMember.role })
    .from(workspaceMember)
    .where(
      and(
        eq(workspaceMember.workspaceId, workspaceId),
        eq(workspaceMember.userId, userId)
      )
    )
  return member?.role ?? null
}

export async function getArtifactRole(
  workspaceId: string,
  artifactId: string,
  userId: string
): Promise<WorkspaceRole | null> {
  const workspaceRole = await getWorkspaceRole(workspaceId, userId)
  if (workspaceRole) return workspaceRole

  const [member] = await db
    .select({ role: artifactMember.role })
    .from(artifactMember)
    .innerJoin(artifact, eq(artifact.id, artifactMember.artifactId))
    .where(
      and(
        eq(artifactMember.artifactId, artifactId),
        eq(artifactMember.userId, userId),
        eq(artifact.workspaceId, workspaceId)
      )
    )
  return member?.role ?? null
}

export async function getSharedArtifacts(workspaceId: string, userId: string) {
  return db
    .select({
      artifactId: artifactMember.artifactId,
      role: artifactMember.role,
    })
    .from(artifactMember)
    .innerJoin(artifact, eq(artifact.id, artifactMember.artifactId))
    .where(
      and(
        eq(artifactMember.userId, userId),
        eq(artifact.workspaceId, workspaceId)
      )
    )
}

export type WorkspaceAccess =
  | { role: WorkspaceRole; sharedArtifacts: null }
  | { role: null; sharedArtifacts: { artifactId: string; role: MemberRole }[] }

export async function getWorkspaceAccess(
  workspaceId: string,
  userId: string
): Promise<WorkspaceAccess | null> {
  const role = await getWorkspaceRole(workspaceId, userId)
  if (role) return { role, sharedArtifacts: null }

  const sharedArtifacts = await getSharedArtifacts(workspaceId, userId)
  return sharedArtifacts.length ? { role: null, sharedArtifacts } : null
}
