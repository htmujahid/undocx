import { type MemberRole } from "@/lib/db/schema"

import { escapeHtml, mailer } from "./mailer"

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
  const safeInviterName = escapeHtml(inviterName)
  const safeResourceName = escapeHtml(resourceName)
  const safeUrl = escapeHtml(url)
  return mailer.sendMail({
    from: "noreply@undocx.com",
    to,
    subject: `${inviterName} invited you to a ${resourceKind} on Undocx`,
    html: `<p>Hi,</p><p>${safeInviterName} invited you to ${roleLabel} the ${resourceKind} <strong>${safeResourceName}</strong> on Undocx.</p><p>Click <a href="${safeUrl}">here</a> to accept the invitation.</p><p>Or copy and paste the link below into your browser:</p><p>${safeUrl}</p><p>This invitation expires in 7 days.</p>`,
  })
}
