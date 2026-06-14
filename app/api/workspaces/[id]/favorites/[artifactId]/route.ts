import { NextResponse } from "next/server"

import { getSession } from "@/lib/auth"
import { getArtifactRole } from "@/lib/db/queries/access"
import { artifactInWorkspace } from "@/lib/db/queries/artifact"
import {
  addFavorite,
  getFavorite,
  removeFavorite,
} from "@/lib/db/queries/favorite"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string; artifactId: string }> }
) {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, artifactId } = await params
  // Favorites are per-user — any role (even viewer) can toggle their own.
  const role = await getArtifactRole(id, artifactId, session.user.id)
  if (!role) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (!(await artifactInWorkspace(id, artifactId)))
    return NextResponse.json({ error: "Not found" }, { status: 404 })

  const existing = await getFavorite(session.user.id, artifactId)

  if (existing) {
    await removeFavorite(session.user.id, artifactId)
    return NextResponse.json({ isFavorited: false })
  }

  await addFavorite(session.user.id, artifactId)
  return NextResponse.json({ isFavorited: true })
}
