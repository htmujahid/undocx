"use client"

import { useState } from "react"

import {
  CheckIcon,
  ChevronsUpDownIcon,
  EditIcon,
  PlusIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  type Workspace,
  deleteWorkspaceMutationOptions,
  updateWorkspaceMutationOptions,
  workspacesQueryOptions,
} from "@/lib/data/workspaces"

import { CreateWorkspaceDialog } from "@/components/workspace/dialogs/create-workspace-dialog"
import { MembersDialog } from "@/components/workspace/sharing/members-dialog"

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function WorkspaceSwitcher({
  currentWorkspaceId,
}: {
  currentWorkspaceId: string
}) {
  const router = useRouter()
  const qc = useQueryClient()
  const { data: workspaces = [], isLoading } = useQuery(workspacesQueryOptions)

  const updateMutation = useMutation({
    ...updateWorkspaceMutationOptions,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: workspacesQueryOptions.queryKey }),
  })
  const deleteMutation = useMutation({
    ...deleteWorkspaceMutationOptions,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: workspacesQueryOptions.queryKey }),
  })

  const [createOpen, setCreateOpen] = useState(false)
  const [membersOpen, setMembersOpen] = useState(false)
  const [editWorkspace, setEditWorkspace] = useState<Workspace | null>(null)
  const [editName, setEditName] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<Workspace | null>(null)

  const active =
    workspaces.find((w) => w.id === currentWorkspaceId) ?? workspaces[0]

  const handleUpdate = () => {
    if (!editWorkspace || !editName.trim() || updateMutation.isPending) return
    updateMutation.mutate(
      { id: editWorkspace.id, name: editName.trim() },
      { onSuccess: () => setEditWorkspace(null) }
    )
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <SidebarMenuButton
                  size="lg"
                  className="data-[popup-open]:bg-sidebar-accent data-[popup-open]:text-sidebar-accent-foreground"
                />
              }
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">
                {isLoading ? "…" : active ? initials(active.name) : "W"}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {active?.name ?? "No workspace"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  Workspace
                </span>
              </div>
              <ChevronsUpDownIcon className="ml-auto size-4" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-(--anchor-width) min-w-52"
              align="start"
            >
              {workspaces.length === 0 && (
                <DropdownMenuItem disabled>No workspaces yet</DropdownMenuItem>
              )}
              {workspaces.map((workspace) => (
                <DropdownMenuItem
                  key={workspace.id}
                  className="group"
                  onClick={() => router.push(`/workspace/${workspace.id}`)}
                >
                  <span className="flex-1 truncate">{workspace.name}</span>
                  {workspace.role !== "owner" && (
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      shared
                    </span>
                  )}
                  {workspace.id === active?.id && (
                    <CheckIcon className="size-3.5 shrink-0" />
                  )}
                  {workspace.role === "owner" && (
                    <button
                      className="hidden size-5 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground group-hover:flex"
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditWorkspace(workspace)
                        setEditName(workspace.name)
                      }}
                    >
                      <EditIcon className="size-3.5" />
                    </button>
                  )}
                  {workspace.role === "owner" && workspaces.length > 1 && (
                    <button
                      className="hidden size-5 items-center justify-center rounded-sm text-destructive group-hover:flex"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteTarget(workspace)
                      }}
                    >
                      <Trash2Icon className="size-3.5" />
                    </button>
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              {active && (
                <DropdownMenuItem onClick={() => setMembersOpen(true)}>
                  <UsersIcon className="text-muted-foreground" />
                  Members
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setCreateOpen(true)}>
                <PlusIcon className="text-muted-foreground" />
                New workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <CreateWorkspaceDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(id) => router.push(`/workspace/${id}`)}
      />

      {active && (
        <MembersDialog
          workspaceId={active.id}
          workspaceName={active.name}
          isOwner={active.role === "owner"}
          open={membersOpen}
          onOpenChange={setMembersOpen}
        />
      )}

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete workspace?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleteTarget?.name}&rdquo; will be permanently deleted.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (!deleteTarget) return
                deleteMutation.mutate(deleteTarget.id, {
                  onSuccess: () => {
                    if (currentWorkspaceId === deleteTarget.id) {
                      const other = workspaces.find(
                        (w) => w.id !== deleteTarget.id
                      )
                      if (other) router.push(`/workspace/${other.id}`)
                    }
                    setDeleteTarget(null)
                  },
                })
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rename dialog */}
      <Dialog
        open={!!editWorkspace}
        onOpenChange={(open) => !open && setEditWorkspace(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename workspace</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Workspace name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
            autoFocus
          />
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditWorkspace(null)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleUpdate}
              disabled={!editName.trim() || updateMutation.isPending}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
