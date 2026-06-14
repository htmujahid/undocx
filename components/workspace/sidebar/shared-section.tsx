"use client"

import { FileTextIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { useQuery } from "@tanstack/react-query"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { sharedWithMeQueryOptions } from "@/lib/data/members"

export function SharedSection() {
  const pathname = usePathname()
  const { data: shared = [] } = useQuery(sharedWithMeQueryOptions)

  if (!shared.length) return null

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Shared with me</SidebarGroupLabel>
      <SidebarMenu>
        {shared.map((item) => {
          const href = `/workspace/${item.workspaceId}/${item.id}`
          return (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                size="sm"
                isActive={pathname === href}
                render={<Link href={href} />}
                title={`${item.title}: ${item.workspaceName}`}
              >
                <FileTextIcon />
                <span className="truncate">{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
