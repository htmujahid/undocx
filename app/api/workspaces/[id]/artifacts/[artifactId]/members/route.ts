import { and, eq } from "drizzle-orm"
import { NextResponse } from "next/server"

import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { getWorkspaceRole } from "@/lib/db/access"
import {
  MEMBER_ROLES,
  type MemberRole,
  artifact,
  artifactMember,
  invitation,
  user,
  workspaceMember,
} from "@/lib/db/schema"
import { sendInvitationEmail, upsertInvitation } from "@/lib/invitations"

async function findArtifact(workspaceId: string, artifactId: string) {
  const [art] = await db
    .select({ id: artifact.id, title: artifact.title })
    .from(artifact)
    .where(and(eq(artifact.id, artifactId), eq(artifact.workspaceId, workspaceId)))
  return art ?? null
}

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

  const art = await findArtifact(id, artifactId)
  if (!art) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const [members, invitations] = await Promise.all([
    db
      .select({
        userId: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: artifactMember.role,
      })
      .from(artifactMember)
      .innerJoin(user, eq(user.id, artifactMember.userId))
      .where(eq(artifactMember.artifactId, artifactId))
      .orderBy(artifactMember.createdAt),
    db
      .select({
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        createdAt: invitation.createdAt,
        expiresAt: invitation.expiresAt,
      })
      .from(invitation)
      .where(eq(invitation.artifactId, artifactId))
      .orderBy(invitation.createdAt),
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

  const art = await findArtifact(id, artifactId)
  if (!art) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const body = await req.json()
  const email = String(body.email ?? "")
    .trim()
    .toLowerCase()
  const memberRole = body.role as MemberRole

  if (!email.includes("@"))
    return NextResponse.json({ error: "Valid email is required" }, {
      status: 400,
    })
  if (!MEMBER_ROLES.includes(memberRole))
    return NextResponse.json({ error: "Invalid role" }, { status: 400 })
  if (email === session.user.email.toLowerCase())
    return NextResponse.json(
      { error: "You already own this document" },
      { status: 400 }
    )

  const [existingUser] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email))

  if (existingUser) {
    const [[wsMember], [artMember]] = await Promise.all([
      db
        .select({ userId: workspaceMember.userId })
        .from(workspaceMember)
        .where(
          and(
            eq(workspaceMember.workspaceId, id),
            eq(workspaceMember.userId, existingUser.id)
          )
        ),
      db
        .select({ userId: artifactMember.userId })
        .from(artifactMember)
        .where(
          and(
            eq(artifactMember.artifactId, artifactId),
            eq(artifactMember.userId, existingUser.id)
          )
        ),
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

  sendInvitationEmail({
    to: email,
    inviterName: session.user.name,
    resourceName: art.title,
    resourceKind: "document",
    role: memberRole,
    token: created.token,
  })

  // The token only travels via email — never back to the inviter's browser.
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
