"use client"

import { Suspense } from "react"

import {
  ArchiveIcon,
  ClockIcon,
  LayoutGridIcon,
  MessageSquareIcon,
  PlusIcon,
  StarIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { NotificationBell } from "@/components/notifications/notification-bell"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { CollectionSection } from "./collection-section"
import { FolderSection } from "./folder-section"
import { SharedSection } from "./shared-section"
import { SidebarUserMenu } from "./sidebar-user-menu"
import { WorkspaceSwitcher } from "./workspace-switcher"

const NAV_ITEMS = [
  { icon: LayoutGridIcon, label: "All Items", path: "" },
  { icon: StarIcon, label: "Favorites", path: "/favorites" },
  { icon: ClockIcon, label: "Recent", path: "/recent" },
  { icon: ArchiveIcon, label: "Archive", path: "/archive" },
  { icon: MessageSquareIcon, label: "Chat", path: "/chat" },
]

export function WorkspaceSidebar({
  user,
  workspaceId,
}: {
  user: { id: string; name: string; email: string; image?: string | null }
  workspaceId: string
}) {
  const pathname = usePathname()
  const basePath = `/workspace/${workspaceId}`

  const isActive = (path: string) => {
    const fullPath = basePath + path
    return path === "" ? pathname === fullPath : pathname.startsWith(fullPath)
  }

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <div className="flex items-center gap-1">
          <div className="min-w-0 flex-1">
            <WorkspaceSwitcher currentWorkspaceId={workspaceId} />
          </div>
          <NotificationBell />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              <SidebarMenuItem className="flex items-center gap-2">
                <SidebarMenuButton
                  tooltip="All Items"
                  className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
                  render={<Link href={basePath} />}
                >
                  <LayoutGridIcon />
                  <span>All Items</span>
                </SidebarMenuButton>
                <Button
                  size="icon"
                  className="size-8 group-data-[collapsible=icon]:opacity-0"
                  variant="outline"
                >
                  <Link href={`${basePath}/new`}>
                    <PlusIcon />
                    <span className="sr-only">New Artifact</span>
                  </Link>
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>

            <SidebarMenu>
              {NAV_ITEMS.filter((item) => item.path !== "").map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    size="sm"
                    isActive={isActive(item.path)}
                    render={<Link href={basePath + item.path} />}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Suspense required because children use useSearchParams(); fallback=null avoids a flash of placeholder content */}
        <Suspense fallback={null}>
          <FolderSection workspaceId={workspaceId} />
        </Suspense>

        <Suspense fallback={null}>
          <CollectionSection workspaceId={workspaceId} />
        </Suspense>

        <SharedSection />
      </SidebarContent>

      <SidebarUserMenu user={user} />
    </Sidebar>
  )
}
