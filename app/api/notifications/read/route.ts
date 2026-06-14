import { NextResponse } from "next/server"

import { getSession } from "@/lib/auth"
import { markNotificationsRead } from "@/lib/db/queries/notification"

export async function POST() {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await markNotificationsRead(session.user.id)

  return new NextResponse(null, { status: 204 })
}
