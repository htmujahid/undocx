"use client"

import { useState } from "react"

import { MailIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useUser } from "@/hooks/use-user"
import {
  type Member,
  type MemberRole,
  artifactMembersQueryOptions,
  inviteMemberMutationOptions,
  removeMemberMutationOptions,
  revokeInvitationMutationOptions,
  updateMemberRoleMutationOptions,
  workspaceMembersQueryOptions,
} from "@/lib/data/members"

const ROLE_ITEMS = [
  { label: "Editor", value: "editor" },
  { label: "Viewer", value: "viewer" },
]

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function ShareMembers({
  workspaceId,
  artifactId,
  canManage,
}: {
  workspaceId: string
  artifactId?: string
  canManage: boolean
}) {
  const qc = useQueryClient()
  const { user } = useUser()
  const membersQuery = artifactId
    ? artifactMembersQueryOptions(workspaceId, artifactId)
    : workspaceMembersQueryOptions(workspaceId)
  const { data, isLoading } = useQuery(membersQuery)

  const [email, setEmail] = useState("")
  const [role, setRole] = useState<MemberRole>("editor")

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: membersQuery.queryKey })

  const invite = useMutation({
    ...inviteMemberMutationOptions,
    onSuccess: () => {
      toast.success(`Invitation sent to ${email.trim()}`)
      setEmail("")
      invalidate()
    },
    onError: (error) => toast.error(error.message),
  })
  const updateRole = useMutation({
    ...updateMemberRoleMutationOptions,
    onSuccess: invalidate,
    onError: (error) => toast.error(error.message),
  })
  const remove = useMutation({
    ...removeMemberMutationOptions,
    onSuccess: invalidate,
    onError: (error) => toast.error(error.message),
  })
  const revoke = useMutation({
    ...revokeInvitationMutationOptions,
    onSuccess: invalidate,
    onError: (error) => toast.error(error.message),
  })

  const handleInvite = () => {
    if (!email.trim() || invite.isPending) return
    invite.mutate({ workspaceId, artifactId, email: email.trim(), role })
  }

  const roleSelect = (member: Member) => (
    <Select
      items={ROLE_ITEMS}
      value={member.role}
      onValueChange={(value) =>
        updateRole.mutate({
          workspaceId,
          artifactId,
          userId: member.userId,
          role: value as MemberRole,
        })
      }
    >
      <SelectTrigger size="sm" className="h-7 border-none shadow-none">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ROLE_ITEMS.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  return (
    <div className="space-y-3">
      {canManage && (
        <div className="flex items-center gap-2">
          <Input
            type="email"
            placeholder="Invite by email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleInvite()}
            className="h-8 flex-1 text-sm"
            aria-label="Invite by email"
          />
          <Select
            items={ROLE_ITEMS}
            value={role}
            onValueChange={(value) => setRole(value as MemberRole)}
          >
            <SelectTrigger size="sm" className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLE_ITEMS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            className="h-8"
            onClick={handleInvite}
            disabled={!email.trim() || invite.isPending}
          >
            Invite
          </Button>
        </div>
      )}

      <div className="space-y-1">
        {isLoading && (
          <p className="py-2 text-xs text-muted-foreground">Loading members…</p>
        )}
        {data?.members.map((member) => {
          const isSelf = member.userId === user?.id
          return (
            <div key={member.userId} className="flex items-center gap-2 py-1">
              <Avatar size="sm">
                {member.image && <AvatarImage src={member.image} />}
                <AvatarFallback>{initials(member.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm leading-tight">
                  {member.name}
                  {isSelf && (
                    <span className="text-muted-foreground"> (you)</span>
                  )}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {member.email}
                </p>
              </div>
              {member.role === "owner" ? (
                <span className="px-2 text-xs text-muted-foreground">
                  Owner
                </span>
              ) : canManage ? (
                roleSelect(member)
              ) : (
                <span className="px-2 text-xs capitalize text-muted-foreground">
                  {member.role}
                </span>
              )}
              {member.role !== "owner" && (canManage || isSelf) && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={isSelf ? "Leave" : "Remove member"}
                  disabled={remove.isPending}
                  onClick={() =>
                    remove.mutate({
                      workspaceId,
                      artifactId,
                      userId: member.userId,
                    })
                  }
                >
                  <XIcon />
                </Button>
              )}
            </div>
          )
        })}
      </div>

      {canManage && !!data?.invitations.length && (
        <div className="space-y-1 border-t pt-2">
          <p className="text-xs font-medium text-muted-foreground">
            Pending invitations
          </p>
          {data.invitations.map((inv) => (
            <div key={inv.id} className="flex items-center gap-2 py-1">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted">
                <MailIcon className="size-3 text-muted-foreground" />
              </div>
              <p className="min-w-0 flex-1 truncate text-sm">{inv.email}</p>
              <span className="text-xs capitalize text-muted-foreground">
                {inv.role}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-destructive"
                aria-label="Revoke invitation"
                disabled={revoke.isPending}
                onClick={() =>
                  revoke.mutate({ workspaceId, invitationId: inv.id })
                }
              >
                <XIcon />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
