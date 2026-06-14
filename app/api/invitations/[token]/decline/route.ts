import { NextResponse } from "next/server"

import { getSession } from "@/lib/auth"
import {
  deleteInvitation,
  getInvitationByToken,
} from "@/lib/db/queries/invitation"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { token } = await params
  const inv = await getInvitationByToken(token)

  if (!inv) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (inv.email !== session.user.email.toLowerCase())
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  await deleteInvitation(inv.id)
  return new NextResponse(null, { status: 204 })
}
