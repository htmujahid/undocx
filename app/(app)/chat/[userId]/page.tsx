import { notFound, redirect } from "next/navigation"

import { UserChatView } from "@/components/workspace/user-chat-view"
import { getSession } from "@/lib/auth"
import { userHasActiveArtifact } from "@/lib/db/queries/artifact"
import { getUserById } from "@/lib/db/queries/user"

export const metadata = { title: "Chat" }

export default async function UserChatPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const session = await getSession()
  if (!session) redirect("/auth/sign-in")

  const { userId } = await params

  const targetUser = await getUserById(userId)
  if (!targetUser) notFound()

  if (!(await userHasActiveArtifact(userId))) notFound()

  return (
    <UserChatView
      userId={userId}
      userName={targetUser.name}
      userImage={targetUser.image ?? null}
    />
  )
}
