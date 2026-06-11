"use client"

import { useState } from "react"

import {
  CheckIcon,
  ChevronsUpDownIcon,
  EditIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"
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
import { CreateWorkspaceDialog } from "./create-workspace-dialog"

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function WorkspaceSwitcher() {
  const qc = useQueryClient()
  const { data: workspaces = [], isLoading } = useQuery(workspacesQueryOptions)

  const updateMutation = useMutation({
    ...updateWorkspaceMutationOptions,
    onSuccess: () => qc.invalidateQueries({ queryKey: workspacesQueryOptions.queryKey }),
  })
  const deleteMutation = useMutation({
    ...deleteWorkspaceMutationOptions,
    onSuccess: () => qc.invalidateQueries({ queryKey: workspacesQueryOptions.queryKey }),
  })

  const [activeId, setActiveId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editWorkspace, setEditWorkspace] = useState<Workspace | null>(null)
  const [editName, setEditName] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<Workspace | null>(null)

  const active = workspaces.find((w) => w.id === activeId) ?? workspaces[0]

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
            {/* render prop avoids button-in-button — Base UI composes the trigger onto SidebarMenuButton */}
            <DropdownMenuTrigger
              render={
                <SidebarMenuButton
                  size="lg"
                  className="data-[popup-open]:bg-sidebar-accent data-[popup-open]:text-sidebar-accent-foreground"
                />
              }
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
                {isLoading ? "…" : active ? initials(active.name) : "W"}
              </div>
              <div className="flex min-w-0 flex-col gap-0.5 leading-none">
                <span className="truncate text-xs font-semibold">
                  {active?.name ?? "No workspace"}
                </span>
                <span className="truncate text-[10px] text-muted-foreground">
                  Workspace
                </span>
              </div>
              <ChevronsUpDownIcon className="ml-auto size-3.5 shrink-0" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-(--anchor-width) min-w-52"
              align="start"
            >
              {workspaces.length === 0 && (
                <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                  No workspaces yet
                </DropdownMenuItem>
              )}
              {workspaces.map((ws) => (
                <DropdownMenuItem
                  key={ws.id}
                  className="group flex items-center gap-2 text-xs"
                  onClick={() => setActiveId(ws.id)}
                >
                  <span className="flex-1 truncate">{ws.name}</span>
                  {ws.id === active?.id && (
                    <CheckIcon className="size-3 shrink-0" />
                  )}
                  <button
                    className="hidden size-4 items-center justify-center rounded hover:text-foreground group-hover:flex"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditWorkspace(ws)
                      setEditName(ws.name)
                    }}
                  >
                    <EditIcon className="size-3" />
                  </button>
                  {workspaces.length > 1 && (
                    <button
                      className="hidden size-4 items-center justify-center rounded text-destructive hover:text-destructive group-hover:flex"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteTarget(ws)
                      }}
                    >
                      <Trash2Icon className="size-3" />
                    </button>
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 text-xs"
                onClick={() => setCreateOpen(true)}
              >
                <PlusIcon className="size-3.5" />
                New workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <CreateWorkspaceDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={setActiveId}
      />

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
                    if (activeId === deleteTarget.id) setActiveId(null)
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
