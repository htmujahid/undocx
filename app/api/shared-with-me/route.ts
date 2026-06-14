import { NextResponse } from "next/server"

import { getSession } from "@/lib/auth"
import { listSharedWithUser } from "@/lib/db/queries/artifact-member"

export async function GET() {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const shared = await listSharedWithUser(session.user.id)

  return NextResponse.json(shared)
}
