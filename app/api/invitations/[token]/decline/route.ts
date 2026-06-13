import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { invitation } from "@/lib/db/schema"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { token } = await params
  const [inv] = await db
    .select({ id: invitation.id, email: invitation.email })
    .from(invitation)
    .where(eq(invitation.token, token))

  if (!inv) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (inv.email !== session.user.email.toLowerCase())
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  await db.delete(invitation).where(eq(invitation.id, inv.id))
  return new NextResponse(null, { status: 204 })
}
