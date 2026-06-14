import { after } from "next/server"
import { NextResponse } from "next/server"

import { syncArtifactChunks } from "@/lib/ai/embeddings"
import { getSession } from "@/lib/auth"
import {
  canEdit,
  getWorkspaceAccess,
  getWorkspaceRole,
} from "@/lib/db/queries/access"
import {
  createArtifactWithLinks,
  getArtifactLinksForIds,
  listActiveArtifacts,
} from "@/lib/db/queries/artifact"
import { filterWorkspaceCollectionIds } from "@/lib/db/queries/collection"
import { filterWorkspaceFolderIds } from "@/lib/db/queries/folder"
import {
  createNotifications,
  listWorkspaceNotifyRecipients,
} from "@/lib/db/queries/notification"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const access = await getWorkspaceAccess(id, session.user.id)
  if (!access) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const sort = new URL(req.url).searchParams.get("sort")

  const artifacts = await listActiveArtifacts({
    workspaceId: id,
    sort,
    // Artifact-level members only see what was shared with them.
    restrictIds: access.sharedArtifacts
      ? access.sharedArtifacts.map((s) => s.artifactId)
      : null,
  })

  const artifactIds = artifacts.map((a) => a.id)
  const { folderLinks, collectionLinks } =
    await getArtifactLinksForIds(artifactIds)

  const result = artifacts.map((a) => ({
    ...a,
    role:
      access.role ??
      access.sharedArtifacts.find((s) => s.artifactId === a.id)?.role ??
      "viewer",
    folderIds: folderLinks
      .filter((l) => l.artifactId === a.id)
      .map((l) => l.folderId),
    collectionIds: collectionLinks
      .filter((l) => l.artifactId === a.id)
      .map((l) => l.collectionId),
  }))

  return NextResponse.json(result)
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const role = await getWorkspaceRole(id, session.user.id)
  if (!role) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (!canEdit(role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { title, content, folderIds, collectionIds } = await req.json()
  if (!title?.trim())
    return NextResponse.json({ error: "Title is required" }, { status: 400 })

  const validFolderIds = await filterWorkspaceFolderIds(id, folderIds)
  const validCollectionIds = await filterWorkspaceCollectionIds(
    id,
    collectionIds
  )

  const created = await createArtifactWithLinks({
    workspaceId: id,
    ownerId: session.user.id,
    title: title.trim(),
    content: content ?? null,
    folderIds: validFolderIds,
    collectionIds: validCollectionIds,
  })

  after(() =>
    syncArtifactChunks(created.id, created.title, created.content).catch(
      (err) => console.error("chunk sync failed for artifact", created.id, err)
    )
  )

  // Tell the rest of the workspace a new document landed. Best-effort, off the
  // response path — a notification failure must never fail the create.
  after(async () => {
    const recipients = await listWorkspaceNotifyRecipients(id, session.user.id)
    await createNotifications(
      recipients.map((userId) => ({
        userId,
        type: "artifact_created" as const,
        actorId: session.user.id,
        workspaceId: id,
        artifactId: created.id,
        data: { actorName: session.user.name, resourceName: created.title },
      }))
    )
  })

  return NextResponse.json(
    {
      ...created,
      folderIds: validFolderIds,
      collectionIds: validCollectionIds,
    },
    { status: 201 }
  )
}
