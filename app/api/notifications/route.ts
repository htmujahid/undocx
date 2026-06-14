import { NextResponse } from "next/server"

import { getSession } from "@/lib/auth"
import {
  countUnreadNotifications,
  listNotifications,
} from "@/lib/db/queries/notification"

export async function GET() {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [notifications, unreadCount] = await Promise.all([
    listNotifications(session.user.id),
    countUnreadNotifications(session.user.id),
  ])

  return NextResponse.json({ notifications, unreadCount })
}
