import Link from "next/link"
import { redirect } from "next/navigation"

import { InvitationActions } from "@/components/invite/invitation-actions"
import { buttonVariants } from "@/components/ui/button"
import { getSession } from "@/lib/auth"
import { getInvitationDetailsByToken } from "@/lib/db/queries/invitation"
import { isInvitationExpired } from "@/lib/mail/invitations"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Invitation",
}

function InviteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex h-11 shrink-0 items-center border-b px-4">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          Undocx
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md rounded-xl border bg-card p-8 text-center shadow-sm">
          {children}
        </div>
      </main>
    </div>
  )
}

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  const inv = await getInvitationDetailsByToken(token)

  if (!inv || isInvitationExpired(inv)) {
    return (
      <InviteShell>
        <h1 className="text-xl font-semibold tracking-tight">
          Invitation not found
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This invitation doesn&apos;t exist, was revoked, or has expired. Ask
          the person who invited you to send a new one.
        </p>
        <Link href="/" className={buttonVariants({ className: "mt-6" })}>
          Go home
        </Link>
      </InviteShell>
    )
  }

  const session = await getSession()
  if (!session) redirect(`/auth/sign-in?redirect=/invite/${token}`)

  const resourceKind = inv.workspaceId ? "workspace" : "document"
  const resourceName = inv.workspaceName ?? inv.artifactTitle ?? "Untitled"
  const roleLabel = inv.role === "editor" ? "edit" : "view"

  if (inv.email !== session.user.email.toLowerCase()) {
    return (
      <InviteShell>
        <h1 className="text-xl font-semibold tracking-tight">Wrong account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This invitation was sent to <strong>{inv.email}</strong>, but
          you&apos;re signed in as <strong>{session.user.email}</strong>. Sign
          in with the invited account to accept it.
        </p>
        <Link
          href="/account/security"
          className={buttonVariants({ variant: "outline", className: "mt-6" })}
        >
          Manage account
        </Link>
      </InviteShell>
    )
  }

  return (
    <InviteShell>
      <h1 className="text-xl font-semibold tracking-tight">
        You&apos;ve been invited
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        <strong className="text-foreground">{inv.inviterName}</strong> invited
        you to {roleLabel} the {resourceKind}
      </p>
      <p className="mt-1 truncate text-lg font-medium">{resourceName}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        as {inv.role === "editor" ? "an editor" : "a viewer"}
      </p>
      <InvitationActions token={token} />
    </InviteShell>
  )
}
