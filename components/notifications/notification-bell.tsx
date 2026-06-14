"use client"

import { BellIcon } from "lucide-react"
import { useRouter } from "next/navigation"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  type AppNotification,
  markNotificationsReadMutationOptions,
  notificationsQueryOptions,
} from "@/lib/data/notifications"
import { cn } from "@/lib/utils"

// One-line message for each notification type, built from the denormalized
// snapshot so it reads correctly even after the resource is gone.
function describe(n: AppNotification): string {
  const { actorName, resourceName, role } = n.data
  switch (n.type) {
    case "invitation_accepted":
      return `${actorName} accepted your invitation to ${resourceName}`
    case "workspace_role_changed":
      return `${actorName} changed your role in ${resourceName} to ${role}`
    case "workspace_removed":
      return `${actorName} removed you from ${resourceName}`
    case "artifact_role_changed":
      return `${actorName} set your access to ${resourceName} to ${role}`
    case "artifact_removed":
      return `${actorName} removed your access to ${resourceName}`
    case "artifact_created":
      return `${actorName} created ${resourceName}`
  }
}

// Where clicking a notification takes you — null when the user no longer has
// access (removals) or the resource has been deleted.
function linkFor(n: AppNotification): string | null {
  if (n.type === "workspace_removed" || n.type === "artifact_removed")
    return null
  if (n.artifactId && n.workspaceId)
    return `/workspace/${n.workspaceId}/${n.artifactId}`
  if (n.workspaceId) return `/workspace/${n.workspaceId}`
  return null
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60 * 60 * 1000],
  ["month", 30 * 24 * 60 * 60 * 1000],
  ["day", 24 * 60 * 60 * 1000],
  ["hour", 60 * 60 * 1000],
  ["minute", 60 * 1000],
]
const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  for (const [unit, ms] of RELATIVE_UNITS) {
    if (diff >= ms) return rtf.format(-Math.floor(diff / ms), unit)
  }
  return "just now"
}

export function NotificationBell() {
  const router = useRouter()
  const qc = useQueryClient()
  const { data } = useQuery(notificationsQueryOptions)
  const notifications = data?.notifications ?? []
  const unreadCount = data?.unreadCount ?? 0

  const markRead = useMutation({
    ...markNotificationsReadMutationOptions,
    onSuccess: () => {
      // Reflect the read state locally without waiting for the next poll.
      qc.setQueryData(
        notificationsQueryOptions.queryKey,
        (prev) =>
          prev && {
            unreadCount: 0,
            notifications: prev.notifications.map((n) => ({
              ...n,
              readAt: n.readAt ?? new Date().toISOString(),
            })),
          }
      )
    },
  })

  // Opening the panel clears the unread badge.
  const onOpenChange = (open: boolean) => {
    if (open && unreadCount > 0 && !markRead.isPending) markRead.mutate()
  }

  return (
    <Popover onOpenChange={onOpenChange}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative size-8 shrink-0"
          />
        }
      >
        <BellIcon className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] leading-4 font-medium text-primary-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        <span className="sr-only">Notifications</span>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 gap-0 p-0">
        <div className="border-b px-3 py-2.5">
          <p className="text-sm font-medium">Notifications</p>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              You&apos;re all caught up.
            </p>
          ) : (
            notifications.map((n) => {
              const link = linkFor(n)
              return (
                <button
                  key={n.id}
                  type="button"
                  disabled={!link}
                  onClick={() => link && router.push(link)}
                  className={cn(
                    "flex w-full items-start gap-2 border-b px-3 py-2.5 text-left last:border-b-0",
                    link
                      ? "cursor-pointer transition-colors hover:bg-accent/50"
                      : "cursor-default",
                    !n.readAt && "bg-accent/30"
                  )}
                >
                  {!n.readAt ? (
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  ) : (
                    <span className="mt-1.5 size-1.5 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">{describe(n)}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
