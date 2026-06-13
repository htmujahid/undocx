"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { ShareMembers } from "./share-members"

export function MembersDialog({
  workspaceId,
  workspaceName,
  isOwner,
  open,
  onOpenChange,
}: {
  workspaceId: string
  workspaceName: string
  isOwner: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Members</DialogTitle>
          <DialogDescription>
            {isOwner
              ? `Invite people to “${workspaceName}”. Members get access to every document in the workspace.`
              : `People with access to “${workspaceName}”.`}
          </DialogDescription>
        </DialogHeader>
        <ShareMembers workspaceId={workspaceId} canManage={isOwner} />
      </DialogContent>
    </Dialog>
  )
}
