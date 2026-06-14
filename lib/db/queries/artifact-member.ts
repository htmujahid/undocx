import { and, eq } from "drizzle-orm"

import { db } from "@/lib/db"
import {
  type MemberRole,
  artifact,
  artifactMember,
  user,
  workspace,
} from "@/lib/db/schema"

export function listArtifactMembers(artifactId: string) {
  return db
    .select({
      userId: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: artifactMember.role,
    })
    .from(artifactMember)
    .innerJoin(user, eq(user.id, artifactMember.userId))
    .where(eq(artifactMember.artifactId, artifactId))
    .orderBy(artifactMember.createdAt)
}

export async function getArtifactMember(artifactId: string, userId: string) {
  const [member] = await db
    .select({ userId: artifactMember.userId })
    .from(artifactMember)
    .where(
      and(
        eq(artifactMember.artifactId, artifactId),
        eq(artifactMember.userId, userId)
      )
    )
  return member ?? null
}

export async function updateArtifactMemberRole(
  artifactId: string,
  userId: string,
  role: MemberRole
) {
  const [updated] = await db
    .update(artifactMember)
    .set({ role })
    .where(
      and(
        eq(artifactMember.artifactId, artifactId),
        eq(artifactMember.userId, userId)
      )
    )
    .returning()
  return updated ?? null
}

export async function removeArtifactMember(artifactId: string, userId: string) {
  const [deleted] = await db
    .delete(artifactMember)
    .where(
      and(
        eq(artifactMember.artifactId, artifactId),
        eq(artifactMember.userId, userId)
      )
    )
    .returning()
  return deleted ?? null
}

export async function upsertArtifactMember(
  artifactId: string,
  userId: string,
  role: MemberRole
) {
  await db
    .insert(artifactMember)
    .values({ artifactId, userId, role })
    .onConflictDoUpdate({
      target: [artifactMember.artifactId, artifactMember.userId],
      set: { role },
    })
}

export function listSharedWithUser(userId: string) {
  return db
    .select({
      id: artifact.id,
      title: artifact.title,
      workspaceId: artifact.workspaceId,
      workspaceName: workspace.name,
      role: artifactMember.role,
      updatedAt: artifact.updatedAt,
    })
    .from(artifactMember)
    .innerJoin(artifact, eq(artifact.id, artifactMember.artifactId))
    .innerJoin(workspace, eq(workspace.id, artifact.workspaceId))
    .where(
      and(eq(artifactMember.userId, userId), eq(artifact.isArchived, false))
    )
    .orderBy(artifact.updatedAt)
}
