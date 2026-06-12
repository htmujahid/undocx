"use client"

import { Suspense } from "react"

import { ArchiveIcon, ClockIcon, LayoutGridIcon, StarIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { CollectionSection } from "./collection-section"
import { FolderSection } from "./folder-section"
import { SidebarUserMenu } from "./sidebar-user-menu"
import { WorkspaceSwitcher } from "./workspace-switcher"

const NAV_ITEMS = [
  { icon: LayoutGridIcon, label: "All Items", path: "" },
  { icon: StarIcon, label: "Favorites", path: "/favorites" },
  { icon: ClockIcon, label: "Recent", path: "/recent" },
  { icon: ArchiveIcon, label: "Archive", path: "/archive" },
]

interface AppSidebarProps {
  user: { name: string; email: string; image?: string | null }
  workspaceId: string
}

export function WorkspaceSidebar({ user, workspaceId }: AppSidebarProps) {
  const pathname = usePathname()
  const basePath = `/workspace/${workspaceId}`

  const isActive = (path: string) => {
    const fullPath = basePath + path
    return path === "" ? pathname === fullPath : pathname.startsWith(fullPath)
  }

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <WorkspaceSwitcher currentWorkspaceId={workspaceId} />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {NAV_ITEMS.map((item) => (
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
        </SidebarGroup>

        {/* Suspense required because children use useSearchParams(); fallback=null avoids a flash of placeholder content */}
        <Suspense fallback={null}>
          <FolderSection workspaceId={workspaceId} />
        </Suspense>

        <Suspense fallback={null}>
          <CollectionSection workspaceId={workspaceId} />
        </Suspense>
      </SidebarContent>

      <SidebarUserMenu user={user} />
    </Sidebar>
  )
}
