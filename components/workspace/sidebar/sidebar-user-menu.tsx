"use client"

import {
  ChevronsUpDownIcon,
  HomeIcon,
  LogOutIcon,
  SettingsIcon,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { signOut } from "@/lib/auth-client"

interface SidebarUserMenuProps {
  user: { name: string; email: string; image?: string | null }
}

export function SidebarUserMenu({ user }: SidebarUserMenuProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }
  const { isMobile } = useSidebar()

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <SidebarFooter>
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
              <Avatar>
                <AvatarImage src={user.image ?? undefined} alt={user.name} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
              <ChevronsUpDownIcon className="ml-auto size-4" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-(--anchor-width) min-w-56"
              side={isMobile ? "bottom" : "top"}
              align="start"
            >
              <DropdownMenuLabel className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">
                  {user.name}
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  {user.email}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem render={<Link href="/workspace" />}>
                  <HomeIcon className="text-muted-foreground" />
                  Home
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/account" />}>
                  <SettingsIcon className="text-muted-foreground" />
                  Account settings
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                <LogOutIcon />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  )
}
