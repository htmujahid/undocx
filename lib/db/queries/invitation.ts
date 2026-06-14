import { randomBytes } from "crypto"
import { and, eq, gt } from "drizzle-orm"

import { db } from "@/lib/db"
import {
  type MemberRole,
  artifact,
  invitation,
  user,
  workspace,
} from "@/lib/db/schema"

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000

export async function upsertInvitation({
  email,
  role,
  invitedBy,
  workspaceId,
  artifactId,
}: {
  email: string
  role: MemberRole
  invitedBy: string
  workspaceId?: string
  artifactId?: string
}) {
  const token = randomBytes(32).toString("base64url")
  const expiresAt = new Date(Date.now() + INVITATION_TTL_MS)

  const target = workspaceId
    ? eq(invitation.workspaceId, workspaceId)
    : eq(invitation.artifactId, artifactId!)

  const [existing] = await db
    .select({ id: invitation.id })
    .from(invitation)
    .where(and(eq(invitation.email, email), target))

  if (existing) {
    const [updated] = await db
      .update(invitation)
      .set({ role, token, expiresAt, invitedBy })
      .where(eq(invitation.id, existing.id))
      .returning()
    return updated
  }

  const [created] = await db
    .insert(invitation)
    .values({
      email,
      role,
      invitedBy,
      workspaceId: workspaceId ?? null,
      artifactId: artifactId ?? null,
      token,
      expiresAt,
    })
    .returning()
  return created
}

export function listWorkspaceInvitations(workspaceId: string) {
  return db
    .select({
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      createdAt: invitation.createdAt,
      expiresAt: invitation.expiresAt,
    })
    .from(invitation)
    .where(eq(invitation.workspaceId, workspaceId))
    .orderBy(invitation.createdAt)
}

export function listArtifactInvitations(artifactId: string) {
  return db
    .select({
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      createdAt: invitation.createdAt,
      expiresAt: invitation.expiresAt,
    })
    .from(invitation)
    .where(eq(invitation.artifactId, artifactId))
    .orderBy(invitation.createdAt)
}

export async function getInvitationByToken(token: string) {
  const [inv] = await db
    .select()
    .from(invitation)
    .where(eq(invitation.token, token))
  return inv ?? null
}

export async function getInvitationById(invitationId: string) {
  const [inv] = await db
    .select({
      id: invitation.id,
      workspaceId: invitation.workspaceId,
      artifactId: invitation.artifactId,
    })
    .from(invitation)
    .where(eq(invitation.id, invitationId))
  return inv ?? null
}

export async function deleteInvitation(id: string) {
  await db.delete(invitation).where(eq(invitation.id, id))
}

export function listUserPendingInvitations(email: string) {
  return db
    .select({
      id: invitation.id,
      token: invitation.token,
      role: invitation.role,
      workspaceId: invitation.workspaceId,
      artifactId: invitation.artifactId,
      workspaceName: workspace.name,
      artifactTitle: artifact.title,
      inviterName: user.name,
      createdAt: invitation.createdAt,
      expiresAt: invitation.expiresAt,
    })
    .from(invitation)
    .innerJoin(user, eq(user.id, invitation.invitedBy))
    .leftJoin(workspace, eq(workspace.id, invitation.workspaceId))
    .leftJoin(artifact, eq(artifact.id, invitation.artifactId))
    .where(
      and(eq(invitation.email, email), gt(invitation.expiresAt, new Date()))
    )
    .orderBy(invitation.createdAt)
}

export async function getInvitationDetailsByToken(token: string) {
  const [inv] = await db
    .select({
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      workspaceId: invitation.workspaceId,
      artifactId: invitation.artifactId,
      expiresAt: invitation.expiresAt,
      inviterName: user.name,
      workspaceName: workspace.name,
      artifactTitle: artifact.title,
    })
    .from(invitation)
    .innerJoin(user, eq(user.id, invitation.invitedBy))
    .leftJoin(workspace, eq(workspace.id, invitation.workspaceId))
    .leftJoin(artifact, eq(artifact.id, invitation.artifactId))
    .where(eq(invitation.token, token))
  return inv ?? null
}
