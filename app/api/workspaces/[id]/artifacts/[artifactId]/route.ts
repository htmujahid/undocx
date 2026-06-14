import { after } from "next/server"
import { NextResponse } from "next/server"

import { syncArtifactChunks } from "@/lib/ai/embeddings"
import { getSession } from "@/lib/auth"
import {
  canEdit,
  getArtifactRole,
  getWorkspaceRole,
} from "@/lib/db/queries/access"
import {
  deleteArtifact,
  getArtifact,
  getArtifactLinks,
  updateArtifactWithLinks,
} from "@/lib/db/queries/artifact"
import { filterWorkspaceCollectionIds } from "@/lib/db/queries/collection"
import { filterWorkspaceFolderIds } from "@/lib/db/queries/folder"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; artifactId: string }> }
) {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, artifactId } = await params
  const role = await getArtifactRole(id, artifactId, session.user.id)
  if (!role) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const found = await getArtifact(id, artifactId)
  if (!found) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const links = await getArtifactLinks(artifactId)
  return NextResponse.json({ ...found, role, ...links })
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; artifactId: string }> }
) {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, artifactId } = await params
  const role = await getArtifactRole(id, artifactId, session.user.id)
  if (!role) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (!canEdit(role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { title, content, isArchived, isPublic, folderIds, collectionIds } =
    await req.json()
  if (title !== undefined && !title?.trim()) {
    return NextResponse.json(
      { error: "Title cannot be empty" },
      { status: 400 }
    )
  }
  // Public exposure is an owner decision, not an editor one.
  if (isPublic !== undefined && role !== "owner")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const validFolderIds =
    folderIds !== undefined
      ? await filterWorkspaceFolderIds(id, folderIds)
      : null
  const validCollectionIds =
    collectionIds !== undefined
      ? await filterWorkspaceCollectionIds(id, collectionIds)
      : null

  const scalarPatch = {
    ...(title !== undefined && { title: title.trim() }),
    ...(content !== undefined && { content }),
    ...(isArchived !== undefined && { isArchived: !!isArchived }),
    ...(isPublic !== undefined && { isPublic: !!isPublic }),
  }

  const updated = await updateArtifactWithLinks({
    workspaceId: id,
    artifactId,
    scalarPatch,
    folderIds: validFolderIds,
    collectionIds: validCollectionIds,
  })

  if (!updated)
    return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (content !== undefined) {
    after(() =>
      syncArtifactChunks(updated.id, updated.title, updated.content).catch(
        (err) =>
          console.error("chunk sync failed for artifact", updated.id, err)
      )
    )
  }

  const links = await getArtifactLinks(artifactId)
  return NextResponse.json({ ...updated, role, ...links })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; artifactId: string }> }
) {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, artifactId } = await params
  // Deleting is a workspace-level action — artifact-only editors can't.
  const role = await getWorkspaceRole(id, session.user.id)
  if (!role) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (!canEdit(role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const deleted = await deleteArtifact(id, artifactId)

  if (!deleted)
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  return new NextResponse(null, { status: 204 })
}
