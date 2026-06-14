import { NextResponse } from "next/server"

import { getSession } from "@/lib/auth"
import { listUserPendingInvitations } from "@/lib/db/queries/invitation"

// Pending invitations addressed to the signed-in user's (verified) email.
// The token is included — the invitee is its rightful holder and the client
// uses it to accept/decline via /api/invitations/[token]/*.
export async function GET() {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const invitations = await listUserPendingInvitations(
    session.user.email.toLowerCase()
  )

  return NextResponse.json(invitations)
}
