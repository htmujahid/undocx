import { redirect } from "next/navigation"

import { ChatView } from "@/components/workspace/chat-view"
import { getSession } from "@/lib/auth"
import { getWorkspaceAccess } from "@/lib/db/access"

export const metadata = { title: "Chat" }

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session) redirect("/auth/sign-in")

  const { id } = await params
  const access = await getWorkspaceAccess(id, session.user.id)
  if (!access) redirect("/workspace")

  return <ChatView workspaceId={id} />
}
