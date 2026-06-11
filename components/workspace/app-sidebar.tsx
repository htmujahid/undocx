"use client"

import {
  ArchiveIcon,
  ClockIcon,
  LayoutGridIcon,
  StarIcon,
} from "lucide-react"

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
  { icon: LayoutGridIcon, label: "All Items" },
  { icon: StarIcon, label: "Favorites" },
  { icon: ClockIcon, label: "Recent" },
  { icon: ArchiveIcon, label: "Archive" },
]

interface AppSidebarProps {
  user: { name: string; email: string; image?: string | null }
  workspaceId: string
  onSignOut: () => void
  selectedFolderId?: string | null
  onFolderSelect?: (folderId: string | null) => void
  selectedCollectionId?: string | null
  onCollectionSelect?: (collectionId: string | null) => void
}

export function AppSidebar({
  user,
  workspaceId,
  onSignOut,
  selectedFolderId,
  onFolderSelect,
  selectedCollectionId,
  onCollectionSelect,
}: AppSidebarProps) {
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
                  isActive={item.label === "All Items" && selectedFolderId === null}
                  onClick={() => item.label === "All Items" && onFolderSelect?.(null)}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <FolderSection
          workspaceId={workspaceId}
          selectedFolderId={selectedFolderId}
          onFolderSelect={onFolderSelect}
        />

        <CollectionSection
          workspaceId={workspaceId}
          selectedCollectionId={selectedCollectionId}
          onCollectionSelect={onCollectionSelect}
        />
      </SidebarContent>

      <SidebarUserMenu user={user} onSignOut={onSignOut} />
    </Sidebar>
  )
}
