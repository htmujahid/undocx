import { NextResponse } from "next/server"

import { getSession } from "@/lib/auth"
import { listUserPendingInvitations } from "@/lib/db/queries/invitation"

export async function GET() {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const invitations = await listUserPendingInvitations(
    session.user.email.toLowerCase()
  )

  return NextResponse.json(invitations)
}
