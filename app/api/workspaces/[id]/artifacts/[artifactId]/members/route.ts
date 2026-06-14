import { NextResponse, after } from "next/server"

import { getSession } from "@/lib/auth"
import { getWorkspaceRole } from "@/lib/db/queries/access"
import { getArtifactTitle } from "@/lib/db/queries/artifact"
import {
  getArtifactMember,
  listArtifactMembers,
} from "@/lib/db/queries/artifact-member"
import {
  listArtifactInvitations,
  upsertInvitation,
} from "@/lib/db/queries/invitation"
import { getUserByEmail } from "@/lib/db/queries/user"
import { getWorkspaceMember } from "@/lib/db/queries/workspace-member"
import { MEMBER_ROLES, type MemberRole } from "@/lib/db/schema"
import { sendInvitationEmail } from "@/lib/mail/invitations"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; artifactId: string }> }
) {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, artifactId } = await params
  const role = await getWorkspaceRole(id, session.user.id)
  if (role !== "owner")
    return NextResponse.json({ error: "Not found" }, { status: 404 })

  const art = await getArtifactTitle(id, artifactId)
  if (!art) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const [members, invitations] = await Promise.all([
    listArtifactMembers(artifactId),
    listArtifactInvitations(artifactId),
  ])

  return NextResponse.json({ members, invitations })
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; artifactId: string }> }
) {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, artifactId } = await params
  const role = await getWorkspaceRole(id, session.user.id)
  if (!role) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (role !== "owner")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const art = await getArtifactTitle(id, artifactId)
  if (!art) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const body = await req.json()
  const email = String(body.email ?? "")
    .trim()
    .toLowerCase()
  const memberRole = body.role as MemberRole

  if (!email.includes("@"))
    return NextResponse.json(
      { error: "Valid email is required" },
      {
        status: 400,
      }
    )
  if (!MEMBER_ROLES.includes(memberRole))
    return NextResponse.json({ error: "Invalid role" }, { status: 400 })
  if (email === session.user.email.toLowerCase())
    return NextResponse.json(
      { error: "You already own this document" },
      { status: 400 }
    )

  const existingUser = await getUserByEmail(email)

  if (existingUser) {
    const [wsMember, artMember] = await Promise.all([
      getWorkspaceMember(id, existingUser.id),
      getArtifactMember(artifactId, existingUser.id),
    ])
    if (wsMember)
      return NextResponse.json(
        { error: "Already has access through the workspace" },
        { status: 409 }
      )
    if (artMember)
      return NextResponse.json(
        { error: "Already a member of this document" },
        { status: 409 }
      )
  }

  const created = await upsertInvitation({
    email,
    role: memberRole,
    invitedBy: session.user.id,
    artifactId,
  })

  after(() =>
    sendInvitationEmail({
      to: email,
      inviterName: session.user.name,
      resourceName: art.title,
      resourceKind: "document",
      role: memberRole,
      token: created.token,
    })
  )

  return NextResponse.json(
    {
      id: created.id,
      email: created.email,
      role: created.role,
      createdAt: created.createdAt,
      expiresAt: created.expiresAt,
    },
    { status: 201 }
  )
}
