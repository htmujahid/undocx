import { type MemberRole } from "@/lib/db/schema"

import { mailer } from "./mailer"

export function isInvitationExpired(inv: { expiresAt: Date }) {
  return inv.expiresAt.getTime() < Date.now()
}

export function invitationUrl(token: string) {
  const base = process.env.BETTER_AUTH_URL ?? "http://localhost:3000"
  return `${base}/invite/${token}`
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
  return mailer.sendMail({
    from: "noreply@renderical.com",
    to,
    subject: `${inviterName} invited you to a ${resourceKind} on Renderical`,
    html: `<p>Hi,</p><p>${inviterName} invited you to ${roleLabel} the ${resourceKind} <strong>${resourceName}</strong> on Renderical.</p><p>Click <a href="${url}">here</a> to accept the invitation.</p><p>Or copy and paste the link below into your browser:</p><p>${url}</p><p>This invitation expires in 7 days.</p>`,
  })
}
