"use client"

import { useState } from "react"

import {
  ArchiveIcon,
  ChevronRightIcon,
  ClockIcon,
  FolderIcon,
  HomeIcon,
  LayoutGridIcon,
  LogOutIcon,
  PlusIcon,
  SettingsIcon,
  StarIcon,
} from "lucide-react"
import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { WorkspaceSwitcher } from "./workspace-switcher"

const NAV_ITEMS = [
  { icon: LayoutGridIcon, label: "All Items", count: 24 },
  { icon: StarIcon, label: "Favorites", count: 5 },
  { icon: ClockIcon, label: "Recent" },
  { icon: ArchiveIcon, label: "Archive", count: 3 },
]

const PLACEHOLDER_FOLDERS = [
  {
    id: "1",
    icon: "📚",
    name: "Research",
    children: [
      { id: "1-1", name: "AI Papers" },
      { id: "1-2", name: "Market Analysis" },
    ],
  },
  {
    id: "2",
    icon: "🎓",
    name: "Learning",
    children: [{ id: "2-1", name: "Flashcard Decks" }],
  },
  { id: "3", icon: "💼", name: "Work", children: [] },
]

const PLACEHOLDER_COLLECTIONS = [
  { id: "1", name: "Product Ideas", color: "#6366f1" },
  { id: "2", name: "Study Material", color: "#22c55e" },
]

const PLACEHOLDER_TAGS = [
  { id: "1", name: "ai", color: "#8b5cf6" },
  { id: "2", name: "research", color: "#3b82f6" },
  { id: "3", name: "todo", color: "#f59e0b" },
  { id: "4", name: "important", color: "#ef4444" },
]

interface AppSidebarProps {
  user: { name: string; email: string; image?: string | null }
  onSignOut: () => void
}

export function AppSidebar({ user, onSignOut }: AppSidebarProps) {
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set(["1"]))

  const toggleFolder = (id: string) =>
    setOpenFolders((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <Sidebar collapsible="offcanvas">
      {/* ── Header ── */}
      <SidebarHeader className="px-2 py-2">
        <WorkspaceSwitcher />
      </SidebarHeader>

      {/* ── Scrollable content ── */}
      <SidebarContent className="px-0">
        <ScrollArea className="h-full">
          <div className="space-y-4 px-2 py-2">
            {/* Navigation */}
            <div className="space-y-0.5">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.label}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <item.icon className="size-3.5 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.count !== undefined && (
                    <span className="text-[10px] opacity-60">{item.count}</span>
                  )}
                </button>
              ))}
            </div>

            <Separator />

            {/* Folders */}
            <div>
              <div className="mb-1 flex items-center justify-between px-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Folders
                </span>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="size-4 opacity-50 hover:opacity-100"
                >
                  <PlusIcon />
                </Button>
              </div>
              <div className="space-y-0.5">
                {PLACEHOLDER_FOLDERS.map((folder) =>
                  folder.children.length > 0 ? (
                    <Collapsible
                      key={folder.id}
                      open={openFolders.has(folder.id)}
                      onOpenChange={() => toggleFolder(folder.id)}
                    >
                      <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                        <ChevronRightIcon
                          className={cn(
                            "size-3 shrink-0 transition-transform",
                            openFolders.has(folder.id) && "rotate-90"
                          )}
                        />
                        <span>{folder.icon}</span>
                        <span className="flex-1 text-left">{folder.name}</span>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="ml-4 mt-0.5 space-y-0.5 border-l pl-3">
                          {folder.children.map((child) => (
                            <button
                              key={child.id}
                              className="flex w-full items-center rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                              {child.name}
                            </button>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <button
                      key={folder.id}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <FolderIcon className="size-3.5 shrink-0" />
                      <span>{folder.icon}</span>
                      <span>{folder.name}</span>
                    </button>
                  )
                )}
              </div>
            </div>

            <Separator />

            {/* Collections */}
            <div>
              <div className="mb-1 flex items-center justify-between px-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Collections
                </span>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="size-4 opacity-50 hover:opacity-100"
                >
                  <PlusIcon />
                </Button>
              </div>
              <div className="space-y-0.5">
                {PLACEHOLDER_COLLECTIONS.map((col) => (
                  <button
                    key={col.id}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: col.color }}
                    />
                    {col.name}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Tags */}
            <div>
              <div className="mb-1 flex items-center justify-between px-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Tags
                </span>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="size-4 opacity-50 hover:opacity-100"
                >
                  <PlusIcon />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5 px-2">
                {PLACEHOLDER_TAGS.map((tag) => (
                  <button
                    key={tag.id}
                    className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] transition-colors hover:bg-muted"
                    style={{ borderColor: `${tag.color}55`, color: tag.color }}
                  >
                    <span
                      className="size-1.5 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </SidebarContent>

      {/* ── Footer ── */}
      <SidebarFooter className="p-2">
        <Separator className="mb-2" />
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center gap-2.5 rounded-lg p-2 text-left outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar size="sm">
              <AvatarImage src={user.image ?? undefined} alt={user.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">{user.name}</p>
              <p className="truncate text-[10px] text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">
                  {user.name}
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  {user.email}
                </span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Link
                  href="/workspace"
                  className="flex w-full items-center gap-2"
                >
                  <HomeIcon />
                  Home
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href="/account"
                  className="flex w-full items-center gap-2"
                >
                  <SettingsIcon />
                  Account settings
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                variant="destructive"
                className="cursor-pointer"
                onClick={onSignOut}
              >
                <LogOutIcon />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
