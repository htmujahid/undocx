import { and, eq } from "drizzle-orm"
import { NextResponse } from "next/server"

import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { getWorkspaceRole } from "@/lib/db/access"
import {
  MEMBER_ROLES,
  type MemberRole,
  invitation,
  user,
  workspace,
  workspaceMember,
} from "@/lib/db/schema"
import { sendInvitationEmail, upsertInvitation } from "@/lib/invitations"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const role = await getWorkspaceRole(id, session.user.id)
  if (!role) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const [[owner], members, invitations] = await Promise.all([
    db
      .select({
        userId: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      })
      .from(workspace)
      .innerJoin(user, eq(user.id, workspace.ownerId))
      .where(eq(workspace.id, id)),
    db
      .select({
        userId: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: workspaceMember.role,
      })
      .from(workspaceMember)
      .innerJoin(user, eq(user.id, workspaceMember.userId))
      .where(eq(workspaceMember.workspaceId, id))
      .orderBy(workspaceMember.createdAt),
    // Pending invitations are a management concern — owner's eyes only.
    role === "owner"
      ? db
          .select({
            id: invitation.id,
            email: invitation.email,
            role: invitation.role,
            createdAt: invitation.createdAt,
            expiresAt: invitation.expiresAt,
          })
          .from(invitation)
          .where(eq(invitation.workspaceId, id))
          .orderBy(invitation.createdAt)
      : Promise.resolve([]),
  ])

  return NextResponse.json({
    members: [{ ...owner, role: "owner" as const }, ...members],
    invitations,
  })
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
  if (role !== "owner")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

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
      { error: "You already own this workspace" },
      { status: 400 }
    )

  const [existingUser] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email))

  if (existingUser) {
    const [existingMember] = await db
      .select({ userId: workspaceMember.userId })
      .from(workspaceMember)
      .where(
        and(
          eq(workspaceMember.workspaceId, id),
          eq(workspaceMember.userId, existingUser.id)
        )
      )
    if (existingMember)
      return NextResponse.json(
        { error: "Already a member of this workspace" },
        { status: 409 }
      )
  }

  const [ws] = await db
    .select({ name: workspace.name })
    .from(workspace)
    .where(eq(workspace.id, id))

  const created = await upsertInvitation({
    email,
    role: memberRole,
    invitedBy: session.user.id,
    workspaceId: id,
  })

  sendInvitationEmail({
    to: email,
    inviterName: session.user.name,
    resourceName: ws.name,
    resourceKind: "workspace",
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
