import { NextResponse } from "next/server"

import { getSession } from "@/lib/auth"
import { getWorkspaceAccess } from "@/lib/db/queries/access"
import {
  getArtifactLinksForIds,
  listArtifactsByIds,
} from "@/lib/db/queries/artifact"
import { listFavoriteArtifactIds } from "@/lib/db/queries/favorite"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const access = await getWorkspaceAccess(id, session.user.id)
  if (!access) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const favorites = await listFavoriteArtifactIds(session.user.id)

  const visibleIds = access.sharedArtifacts
    ? new Set(access.sharedArtifacts.map((s) => s.artifactId))
    : null

  const favoriteIds = favorites.filter(
    (artifactId) => !visibleIds || visibleIds.has(artifactId)
  )
  if (!favoriteIds.length) return NextResponse.json([])

  const artifacts = await listArtifactsByIds(id, favoriteIds)

  const artifactIds = artifacts.map((a) => a.id)
  const { folderLinks, collectionLinks } =
    await getArtifactLinksForIds(artifactIds)

  return NextResponse.json(
    artifacts.map((a) => ({
      ...a,
      folderIds: folderLinks
        .filter((l) => l.artifactId === a.id)
        .map((l) => l.folderId),
      collectionIds: collectionLinks
        .filter((l) => l.artifactId === a.id)
        .map((l) => l.collectionId),
    }))
  )
}
