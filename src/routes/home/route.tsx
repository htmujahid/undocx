import { Link, Outlet, createFileRoute, redirect } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { authClient } from "@/lib/auth-client"
import { ChevronDownIcon, LogOutIcon } from "lucide-react"

export const Route = createFileRoute("/home")({
  beforeLoad: ({ context }) => {
    if (!context.user) throw redirect({ to: "/auth/sign-in" })
  },
  component: HomeLayout,
})

function HomeLayout() {
  const { user } = Route.useRouteContext()

  async function handleSignOut() {
    await authClient.signOut()
    window.location.href = "/"
  }

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-3.5 text-primary-foreground"
              >
                <path d="M4 6h16M4 10h16M4 14h8M4 18h8" />
                <path d="M19 14l-3 3 3 3" />
                <path d="m22 14-3 3 3 3" />
              </svg>
            </div>
            <span className="text-sm font-semibold">Tarteeb AI</span>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" size="sm" className="gap-1.5">
                <span className="text-sm">{user?.name}</span>
                <ChevronDownIcon className="size-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={handleSignOut}
                variant="destructive"
              >
                <LogOutIcon />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <Outlet />
    </div>
  )
}
