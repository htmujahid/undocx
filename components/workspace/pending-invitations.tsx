"use client"

import { MailIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import {
  type MyInvitation,
  myInvitationsQueryOptions,
  respondToInvitationMutationOptions,
  sharedWithMeQueryOptions,
} from "@/lib/data/members"
import { workspacesQueryOptions } from "@/lib/data/workspaces"

// Banner listing invitations waiting on the signed-in user. Lets them accept
// in-app without digging up the invitation email. Hidden when there are none.
export function PendingInvitations() {
  const router = useRouter()
  const qc = useQueryClient()
  const { data: invitations = [] } = useQuery(myInvitationsQueryOptions)

  const respond = useMutation({
    ...respondToInvitationMutationOptions,
    onSuccess: (target, { action }) => {
      qc.invalidateQueries({ queryKey: myInvitationsQueryOptions.queryKey })
      if (action === "decline") {
        toast.success("Invitation declined")
        return
      }
      qc.invalidateQueries({ queryKey: workspacesQueryOptions.queryKey })
      qc.invalidateQueries({ queryKey: sharedWithMeQueryOptions.queryKey })
      toast.success("Invitation accepted")
      if (target) {
        router.push(
          target.artifactId
            ? `/workspace/${target.workspaceId}/${target.artifactId}`
            : `/workspace/${target.workspaceId}`
        )
      }
    },
    onError: (error) => toast.error(error.message),
  })

  if (!invitations.length) return null

  const describe = (inv: MyInvitation) => {
    const kind = inv.workspaceId ? "workspace" : "document"
    const name = inv.workspaceName ?? inv.artifactTitle ?? "Untitled"
    return { kind, name }
  }

  return (
    <div className="mx-4 mt-3 space-y-2">
      {invitations.map((inv) => {
        const { kind, name } = describe(inv)
        return (
          <div
            key={inv.id}
            className="flex flex-col gap-2 rounded-lg border bg-card px-3 py-2.5 shadow-xs sm:flex-row sm:items-center sm:gap-3"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
                <MailIcon className="size-3.5 text-muted-foreground" />
              </div>
              <p className="min-w-0 flex-1 text-sm sm:truncate">
                <span className="font-medium">{inv.inviterName}</span>
                <span className="text-muted-foreground">
                  {" "}
                  invited you to the {kind}{" "}
                </span>
                <span className="font-medium">{name}</span>
                <span className="text-muted-foreground">
                  {" "}
                  as {inv.role === "editor" ? "an editor" : "a viewer"}
                </span>
              </p>
            </div>
            <div className="flex shrink-0 justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={respond.isPending}
                onClick={() =>
                  respond.mutate({ token: inv.token, action: "decline" })
                }
              >
                Decline
              </Button>
              <Button
                size="sm"
                disabled={respond.isPending}
                onClick={() =>
                  respond.mutate({ token: inv.token, action: "accept" })
                }
              >
                Accept
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
