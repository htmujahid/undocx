import { randomBytes } from "crypto"

import { and, eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { type MemberRole, invitation } from "@/lib/db/schema"
import { mailer } from "@/lib/mailer"

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000

export function isInvitationExpired(inv: { expiresAt: Date }) {
  return inv.expiresAt.getTime() < Date.now()
}

export function invitationUrl(token: string) {
  const base = process.env.BETTER_AUTH_URL ?? "http://localhost:3000"
  return `${base}/invite/${token}`
}

// One pending invitation per email per target — re-inviting refreshes the
// role, token, and expiry instead of stacking rows.
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

export function sendInvitationEmail({
  to,
  inviterName,
  resourceName,
  resourceKind,
  role,
  token,
}: {
  to: string
  inviterName: string
  resourceName: string
  resourceKind: "workspace" | "document"
  role: MemberRole
  token: string
}) {
  const url = invitationUrl(token)
  const roleLabel = role === "editor" ? "edit" : "view"
  void mailer.sendMail({
    from: "noreply@renderical.com",
    to,
    subject: `${inviterName} invited you to a ${resourceKind} on Renderical`,
    html: `<p>Hi,</p><p>${inviterName} invited you to ${roleLabel} the ${resourceKind} <strong>${resourceName}</strong> on Renderical.</p><p>Click <a href="${url}">here</a> to accept the invitation.</p><p>Or copy and paste the link below into your browser:</p><p>${url}</p><p>This invitation expires in 7 days.</p>`,
  })
}
