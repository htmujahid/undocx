"use client"

import { useState } from "react"

import { ChevronRightIcon, MailIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  type MyInvitation,
  myInvitationsQueryOptions,
  respondToInvitationMutationOptions,
  sharedWithMeQueryOptions,
} from "@/lib/data/members"
import { workspacesQueryOptions } from "@/lib/data/workspaces"

export function PendingInvitations() {
  const router = useRouter()
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
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
        setOpen(false)
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
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="px-4 pt-3">
        <div className="mx-auto max-w-3xl">
          <DialogTrigger
            render={
              <Alert className="cursor-pointer transition-colors hover:bg-accent/50" />
            }
          >
            <MailIcon />
            <AlertTitle>
              {invitations.length === 1
                ? "1 pending invitation"
                : `${invitations.length} pending invitations`}
            </AlertTitle>
            <AlertDescription>
              You've been invited to collaborate. Click to review and respond.
            </AlertDescription>
            <AlertAction>
              <ChevronRightIcon className="size-4 text-muted-foreground" />
            </AlertAction>
          </DialogTrigger>
        </div>
      </div>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Pending invitations</DialogTitle>
          <DialogDescription>
            Accept or decline the invitations waiting on you.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {invitations.map((inv) => {
            const { kind, name } = describe(inv)
            return (
              <div
                key={inv.id}
                className="flex flex-col gap-2 rounded-lg border px-3 py-2.5 sm:flex-row sm:items-center sm:gap-3"
              >
                <p className="min-w-0 flex-1 text-sm">
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
      </DialogContent>
    </Dialog>
  )
}
