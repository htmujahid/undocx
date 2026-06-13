import { and, eq } from "drizzle-orm"

import { notFound, redirect } from "next/navigation"

import { UserChatView } from "@/components/workspace/user-chat-view"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { artifact, user } from "@/lib/db/schema"

export const metadata = { title: "Chat" }

export default async function UserChatPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const session = await getSession()
  if (!session) redirect("/auth/sign-in")

  const { userId } = await params

  const [targetUser] = await db
    .select({ id: user.id, name: user.name, image: user.image })
    .from(user)
    .where(eq(user.id, userId))

  if (!targetUser) notFound()

  const [anyArtifact] = await db
    .select({ id: artifact.id })
    .from(artifact)
    .where(
      and(
        eq(artifact.ownerId, userId),
        eq(artifact.isArchived, false)
      )
    )
    .limit(1)

  if (!anyArtifact) notFound()

  return (
    <UserChatView
      userId={userId}
      userName={targetUser.name}
      userImage={targetUser.image ?? null}
    />
  )
}
