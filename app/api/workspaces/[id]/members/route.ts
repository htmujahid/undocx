import { NextResponse, after } from "next/server"

import { getSession } from "@/lib/auth"
import { getWorkspaceRole } from "@/lib/db/queries/access"
import {
  listWorkspaceInvitations,
  upsertInvitation,
} from "@/lib/db/queries/invitation"
import { getUserByEmail } from "@/lib/db/queries/user"
import { getWorkspaceName } from "@/lib/db/queries/workspace"
import {
  getWorkspaceMember,
  getWorkspaceOwnerProfile,
  listWorkspaceMembers,
} from "@/lib/db/queries/workspace-member"
import { MEMBER_ROLES, type MemberRole } from "@/lib/db/schema"
import { sendInvitationEmail } from "@/lib/mail/invitations"

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

  const [owner, members, invitations] = await Promise.all([
    getWorkspaceOwnerProfile(id),
    listWorkspaceMembers(id),
    role === "owner" ? listWorkspaceInvitations(id) : Promise.resolve([]),
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
      { error: "You already own this workspace" },
      { status: 400 }
    )

  const existingUser = await getUserByEmail(email)

  if (existingUser) {
    const existingMember = await getWorkspaceMember(id, existingUser.id)
    if (existingMember)
      return NextResponse.json(
        { error: "Already a member of this workspace" },
        { status: 409 }
      )
  }

  const workspace = await getWorkspaceName(id)

  const created = await upsertInvitation({
    email,
    role: memberRole,
    invitedBy: session.user.id,
    workspaceId: id,
  })

  after(() =>
    sendInvitationEmail({
      to: email,
      inviterName: session.user.name,
      resourceName: workspace!.name,
      resourceKind: "workspace",
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
